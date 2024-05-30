export abstract class Particle {
  position: Coords;
  velocity: Coords;
  color: { front: string; back: string };

  constructor() {
    this.position = { x: 0, y: 0 };
    this.color = { front: "", back: "" };
    this.velocity = { x: 0, y: 0 };
  }

  abstract render(ctx: CanvasRenderingContext2D, mask: Coords): void;
  protected abstract applyPhysics(): void;
}
