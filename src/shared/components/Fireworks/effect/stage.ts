// Types for the Ticker class
type TickerCallback = (frameTime: number, lag: number) => void;

// Ticker class
export class Ticker {
  private static started: boolean = false;
  private static lastTimestamp: number = 0;
  private static listeners: TickerCallback[] = [];

  // Queue up a new frame (calls frameHandler)
  private static queueFrame(): void {
    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(Ticker.frameHandler);
    } else {
      (window as any).webkitRequestAnimationFrame(Ticker.frameHandler);
    }
  }

  private static frameHandler(timestamp: number): void {
    let frameTime = timestamp - Ticker.lastTimestamp;
    Ticker.lastTimestamp = timestamp;

    // Make sure negative time isn't reported (first frame can be whacky)
    if (frameTime < 0) {
      frameTime = 17;
    }
    // Cap minimum framerate to 15fps[~68ms] (assuming 60fps[~17ms] as 'normal')
    else if (frameTime > 68) {
      frameTime = 68;
    }

    // Fire custom listeners
    Ticker.listeners.forEach((listener) =>
      listener.call(window, frameTime, frameTime / 16.6667)
    );

    // Always queue another frame
    Ticker.queueFrame();
  }

  // Public method to add listeners
  public static addListener(callback: TickerCallback): void {
    if (typeof callback !== "function") {
      throw new Error(
        "Ticker.addListener() requires a function reference passed for a callback."
      );
    }

    Ticker.listeners.push(callback);

    // Start frame-loop lazily
    if (!Ticker.started) {
      Ticker.started = true;
      Ticker.queueFrame();
    }
  }
}

// Types for the Stage class
interface PointerEvent {
  type: string;
  x: number;
  y: number;
  onCanvas: boolean;
}

interface Point {
  x: number;
  y: number;
}

interface StageListeners {
  resize: Function[];
  pointerstart: Function[];
  pointermove: Function[];
  pointerend: Function[];
  lastPointerPos: Point;
}

// Stage class
export class Stage {
  private static stages: Stage[] = [];
  private static lastTouchTimestamp: number = 0;
  public static disableHighDPI: boolean = false;

  public canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public speed: number;
  public dpr: number;
  public width: number;
  public height: number;
  public naturalWidth: number;
  public naturalHeight: number;
  private _listeners: StageListeners;

  constructor(canvas: string | HTMLCanvasElement) {
    if (typeof canvas === "string") {
      const element = document.getElementById(canvas);
      if (!element || !(element instanceof HTMLCanvasElement)) {
        throw new Error("Invalid canvas element or ID");
      }
      canvas = element;
    }

    // Canvas and associated context references
    this.canvas = canvas;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Could not get 2D context from canvas");
    }
    this.ctx = context;

    // Prevent gestures on stages
    this.canvas.style.touchAction = "none";

    // Physics speed multiplier
    this.speed = 1;

    // Device pixel ratio calculation
    this.dpr = Stage.disableHighDPI
      ? 1
      : (window.devicePixelRatio || 1) /
        ((this.ctx as any).backingStorePixelRatio || 1);

    // Canvas size initialization
    this.width = canvas.width;
    this.height = canvas.height;
    this.naturalWidth = this.width * this.dpr;
    this.naturalHeight = this.height * this.dpr;

    // Size canvas to match natural size
    if (this.width !== this.naturalWidth) {
      this.canvas.width = this.naturalWidth;
      this.canvas.height = this.naturalHeight;
      this.canvas.style.width = `${this.width}px`;
      this.canvas.style.height = `${this.height}px`;
    }

    Stage.stages.push(this);

    // Initialize event listeners
    this._listeners = {
      resize: [],
      pointerstart: [],
      pointermove: [],
      pointerend: [],
      lastPointerPos: { x: 0, y: 0 },
    };
  }

  public addEventListener(event: string, handler: Function): void {
    if (event === "ticker") {
      Ticker.addListener(handler as TickerCallback);
    } else if (event in this._listeners) {
      (this._listeners as any)[event].push(handler);
    } else {
      throw new Error("Invalid Event");
    }
  }

  public dispatchEvent(event: string, val?: any): void {
    const listeners = (this._listeners as any)[event];
    if (listeners) {
      listeners.forEach((listener: Function) => listener.call(this, val));
    } else {
      throw new Error("Invalid Event");
    }
  }

  public resize(w: number, h: number): void {
    this.width = w;
    this.height = h;
    this.naturalWidth = w * this.dpr;
    this.naturalHeight = h * this.dpr;
    this.canvas.width = this.naturalWidth;
    this.canvas.height = this.naturalHeight;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.dispatchEvent("resize");
  }

  private pointerEvent(type: string, x: number, y: number): void {
    const evt: PointerEvent = {
      type,
      x,
      y,
      onCanvas: x >= 0 && x <= this.width && y >= 0 && y <= this.height,
    };

    this.dispatchEvent(`pointer${type}`, evt);
  }

  // Static methods
  private static windowToCanvas(
    canvas: HTMLCanvasElement,
    x: number,
    y: number
  ): Point {
    const bbox = canvas.getBoundingClientRect();
    return {
      x: (x - bbox.left) * (canvas.width / bbox.width),
      y: (y - bbox.top) * (canvas.height / bbox.height),
    };
  }

  private static mouseHandler(evt: MouseEvent): void {
    if (Date.now() - Stage.lastTouchTimestamp < 500) {
      return;
    }

    let type = "start";
    if (evt.type === "mousemove") {
      type = "move";
    } else if (evt.type === "mouseup") {
      type = "end";
    }

    Stage.stages.forEach((stage) => {
      const pos = Stage.windowToCanvas(stage.canvas, evt.clientX, evt.clientY);
      stage.pointerEvent(type, pos.x / stage.dpr, pos.y / stage.dpr);
    });
  }

  private static touchHandler(evt: TouchEvent): void {
    Stage.lastTouchTimestamp = Date.now();

    let type = "start";
    if (evt.type === "touchmove") {
      type = "move";
    } else if (evt.type === "touchend") {
      type = "end";
    }

    Stage.stages.forEach((stage) => {
      Array.from(evt.changedTouches).forEach((touch) => {
        let pos: Point;
        if (type !== "end") {
          pos = Stage.windowToCanvas(
            stage.canvas,
            touch.clientX,
            touch.clientY
          );
          stage._listeners.lastPointerPos = pos;
          if (type === "start") {
            stage.pointerEvent("move", pos.x / stage.dpr, pos.y / stage.dpr);
          }
        } else {
          pos = stage._listeners.lastPointerPos;
        }
        stage.pointerEvent(type, pos.x / stage.dpr, pos.y / stage.dpr);
      });
    });
  }
}

// Add event listeners
document.addEventListener("mousedown", Stage.mouseHandler.bind(Stage));
document.addEventListener("mousemove", Stage.mouseHandler.bind(Stage));
document.addEventListener("mouseup", Stage.mouseHandler.bind(Stage));
document.addEventListener("touchstart", Stage.touchHandler.bind(Stage));
document.addEventListener("touchmove", Stage.touchHandler.bind(Stage));
document.addEventListener("touchend", Stage.touchHandler.bind(Stage));
