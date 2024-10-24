type Listener = (frameTime: number, rate: number) => void;

export class Ticker {
  started: boolean;
  lastTimestamp: number;
  listeners: Listener[];

  constructor() {
    this.started = false;
    this.lastTimestamp = 0;
    this.listeners = [];
  }

  addListener(callback: Listener) {
    if (typeof callback !== "function")
      throw "Ticker.addListener() requires a function reference passed for a callback.";

    this.listeners.push(callback);

    // start frame-loop lazily
    if (!this.started) {
      this.started = true;
      this.queueFrame();
    }
  }

  // queue up a new frame (calls frameHandler)
  private queueFrame() {
    requestAnimationFrame(this.frameHandler.bind(this));
  }

  private frameHandler(timestamp: number) {
    let frameTime = timestamp - this.lastTimestamp;
    this.lastTimestamp = timestamp;
    // make sure negative time isn't reported (first frame can be whacky)
    if (frameTime < 0) {
      frameTime = 17;
    }
    // - cap minimum framerate to 15fps[~68ms] (assuming 60fps[~17ms] as 'normal')
    else if (frameTime > 68) {
      frameTime = 68;
    }

    // fire custom listeners
    this.listeners.forEach((listener) =>
      listener.call(window, frameTime, frameTime / 16.6667),
    );

    // always queue another frame
    this.queueFrame();
  }
}
