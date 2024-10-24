import { Ticker } from "./ticker";

type Handler = (...values: any) => void;
type StageEvent = "resize" | "pointerstart" | "pointermove" | "pointerend";

export class Stage {
  static disableHighDPI = false;
  static stages: Stage[] = [];
  static lastTouchTimestamp = 0;

  private listeners: {
    lastPointerPos: { x: number; y: number };
    // canvas resizing
    resize: Array<Handler>;
    // pointer events
    pointerstart: Array<Handler>;
    pointermove: Array<Handler>;
    pointerend: Array<Handler>;
  };

  public width: number;
  public height: number;
  private naturalWidth: number;
  private naturalHeight: number;

  private canvas: HTMLCanvasElement;
  public ctx: CanvasRenderingContext2D;
  public speed: number;
  public dpr: number;

  ticker: Ticker;

  constructor(canvasOrSelector: HTMLCanvasElement | string) {
    const canvas =
      typeof canvasOrSelector === "string"
        ? (document.querySelector(canvasOrSelector) as HTMLCanvasElement)
        : canvasOrSelector;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d")!;

    // Prevent gestures on stages (scrolling, zooming, etc)
    this.canvas.style.touchAction = "none";

    // physics speed multiplier: allows slowing down or speeding up simulation (must be manually implemented in physics layer)
    this.speed = 1;

    // devicePixelRatio alias (should only be used for rendering, physics shouldn't care)
    // avoids rendering unnecessary pixels that browser might handle natively via CanvasRenderingContext2D.backingStorePixelRatio
    this.dpr = Stage.disableHighDPI ? 1 : window.devicePixelRatio || 1;

    // canvas size in DIPs and natural pixels
    this.width = canvas.width;
    this.height = canvas.height;
    this.naturalWidth = this.width * this.dpr;
    this.naturalHeight = this.height * this.dpr;

    // size canvas to match natural size
    if (this.width !== this.naturalWidth) {
      this.canvas.width = this.naturalWidth;
      this.canvas.height = this.naturalHeight;
      this.canvas.style.width = this.width + "px";
      this.canvas.style.height = this.height + "px";
    }

    Stage.stages.push(this);

    // event listeners (note that 'ticker' is also an option, for frame events)
    this.listeners = {
      resize: [],
      pointerstart: [],
      pointermove: [],
      pointerend: [],
      lastPointerPos: { x: 0, y: 0 },
    };

    this.ticker = new Ticker();
  }

  addEventListener(event: StageEvent | "ticker", handler: Handler) {
    if (event === "ticker") this.ticker.addListener(handler);
    else this.listeners[event].push(handler);
  }

  dispatchEvent(event: StageEvent, val?: unknown) {
    const listeners = this.listeners[event];
    listeners.forEach((listener) => listener.call(this, val));
  }

  resize(w: number, h: number) {
    this.width = w;
    this.height = h;
    this.naturalWidth = w * this.dpr;
    this.naturalHeight = h * this.dpr;
    this.canvas.width = this.naturalWidth;
    this.canvas.height = this.naturalHeight;
    this.canvas.style.width = w + "px";
    this.canvas.style.height = h + "px";

    this.dispatchEvent("resize");
  }

  static windowToCanvas(canvas: HTMLCanvasElement, x: number, y: number) {
    const bbox = canvas.getBoundingClientRect();
    return {
      x: (x - bbox.left) * (canvas.width / bbox.width),
      y: (y - bbox.top) * (canvas.height / bbox.height),
    };
  }

  static mouseHandler(event: MouseEvent) {
    // Prevent mouse events from firing immediately after touch events
    if (Date.now() - this.lastTouchTimestamp < 500) {
      return;
    }

    let type = "start";
    if (event.type === "mousemove") {
      type = "move";
    } else if (event.type === "mouseup") {
      type = "end";
    }

    this.stages.forEach((stage) => {
      const pos = this.windowToCanvas(
        stage.canvas,
        event.clientX,
        event.clientY,
      );
      stage.pointerEvent(type, pos.x / stage.dpr, pos.y / stage.dpr);
    });
  }

  static touchHandler(event: TouchEvent) {
    this.lastTouchTimestamp = Date.now();

    // Set generic event type
    let type = "start";
    if (event.type === "touchmove") {
      type = "move";
    } else if (event.type === "touchend") {
      type = "end";
    }

    // Dispatch "pointer events" for all changed touches across all stages.
    this.stages.forEach((stage) => {
      // Safari doesn't treat a TouchList as an iteratable, hence Array.from()
      for (let touch of Array.from(event.changedTouches)) {
        let pos;
        if (type !== "end") {
          pos = this.windowToCanvas(stage.canvas, touch.clientX, touch.clientY);
          stage.listeners.lastPointerPos = pos;
          // before touchstart event, fire a move event to better emulate cursor events
          if (type === "start")
            stage.pointerEvent("move", pos.x / stage.dpr, pos.y / stage.dpr);
        } else {
          // on touchend, fill in position information based on last known touch location
          pos = stage.listeners.lastPointerPos;
        }
        stage.pointerEvent(type, pos.x / stage.dpr, pos.y / stage.dpr);
      }
    });
  }

  pointerEvent(type: string, x: number, y: number) {
    const event = {
      type: type,
      x: x,
      y: y,
    };

    this.dispatchEvent(("pointer" + type) as StageEvent, event);
  }
}
