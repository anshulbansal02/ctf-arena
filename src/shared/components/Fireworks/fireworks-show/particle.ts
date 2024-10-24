import { COLOR_CODES_W_INVISIBLE } from "./colors";

export function createParticleArc(
  start: number,
  arcLength: number,
  count: number,
  randomness: number,
  particleFactory: (angle: number) => void,
) {
  const angleDelta = arcLength / count;
  const end = start + arcLength - angleDelta * 0.5;

  if (end > start) {
    for (let angle = start; angle < end; angle = angle + angleDelta) {
      particleFactory(angle + Math.random() * angleDelta * randomness);
    }
  } else {
    for (let angle = start; angle > end; angle = angle + angleDelta) {
      particleFactory(angle + Math.random() * angleDelta * randomness);
    }
  }
}

function createParticleCollection<T>() {
  const collection: Record<string, Array<T>> = {};
  COLOR_CODES_W_INVISIBLE.forEach((color) => {
    collection[color] = [];
  });
  return collection;
}

export class Star {
  static drawWidth = 3;
  static airDrag = 0.98;
  static airDragHeavy = 0.992;

  updateFrame?: number;

  visible: boolean;
  heavy: boolean;
  x: number;
  y: number;
  prevX: number;
  prevY: number;
  color: string;
  speedX: number;
  speedY: number;
  life: number;
  fullLife: number;
  spinAngle: number;
  spinSpeed: number;
  spinRadius: number;
  sparkFreq: number;
  sparkSpeed: number;
  sparkTimer: number;
  sparkColor: string;
  sparkLife: number;
  sparkLifeVariation: number;
  strobe: boolean;
  strobeFreq: number;
  onDeath: ((star: Star) => void) | null = null;
  secondColor: string | null = null;
  transitionTime?: number;
  colorChanged?: boolean;

  static active = createParticleCollection<Star>();
  private static pool: Array<Star> = [];

  private constructor(opts: {
    x: number;
    y: number;
    color: string;
    angle: number;
    speed: number;
    life: number;
    speedOffX?: number;
    speedOffY?: number;
  }) {
    this.visible = true;
    this.heavy = false;
    this.x = opts.x;
    this.y = opts.y;
    this.prevX = opts.x;
    this.prevY = opts.y;
    this.color = opts.color;
    this.speedX = Math.sin(opts.angle) * opts.speed + (opts.speedOffX || 0);
    this.speedY = Math.cos(opts.angle) * opts.speed + (opts.speedOffY || 0);
    this.life = opts.life;
    this.fullLife = opts.life;
    this.spinAngle = Math.random() * Math.PI * 2;
    this.spinSpeed = 0.8;
    this.spinRadius = 0;
    this.sparkFreq = 0;
    this.sparkSpeed = 1;
    this.sparkTimer = 0;
    this.sparkColor = opts.color;
    this.sparkLife = 750;
    this.sparkLifeVariation = 0.25;
    this.strobe = false;
    this.strobeFreq = 0;
  }

  static add(
    x: number,
    y: number,
    color: string,
    angle: number,
    speed: number,
    life: number,
    speedOffX?: number,
    speedOffY?: number,
  ) {
    const instance =
      this.pool.pop() ||
      new Star({ x, y, color, angle, speed, life, speedOffX, speedOffY });

    this.active[color].push(instance);
    return instance;
  }

  static returnInstance(instance: Star) {
    instance.onDeath?.(instance);
    instance.onDeath = null;
    instance.secondColor = null;
    instance.transitionTime = 0;
    instance.colorChanged = false;
    this.pool.push(instance);
  }
}

export class Spark {
  static drawWidth = 0;
  static airDrag = 0.9;

  static active = createParticleCollection<Spark>();
  private static pool: Array<Spark> = [];

  private constructor(
    public x: number,
    public y: number,
    public prevX: number,
    public prevY: number,
    public color: string,
    public speedX: number,
    public speedY: number,
    public life: number,
  ) {}

  static add(
    x: number,
    y: number,
    color: string,
    angle: number,
    speed: number,
    life: number,
  ) {
    const instance =
      this.pool.pop() ||
      new Spark(
        x,
        y,
        x,
        y,
        color,
        Math.sin(angle) * speed,
        Math.cos(angle) * speed,
        life,
      );
    this.active[color].push(instance);
    return instance;
  }

  static returnInstance(instance: Spark) {
    this.pool.push(instance);
  }
}

export class BurstFlash {
  static active: Array<BurstFlash> = [];
  private static pool: Array<BurstFlash> = [];

  private constructor(
    public readonly x: number,
    public readonly y: number,
    public readonly radius: number,
  ) {}

  static add(x: number, y: number, radius: number) {
    const instance = this.pool.pop() || new BurstFlash(x, y, radius);
    this.active.push(instance);
    return instance;
  }

  static returnInstance(instance: BurstFlash) {
    this.pool.push(instance);
  }
}
