export abstract class Particle {
  position: Coords | null = null;
  velocity: Coords;
  color: Color2D;

  constructor(init: { color: Color2D; velocity: Coords }) {
    this.color = init.color;
    this.velocity = init.velocity;
  }

  abstract render(ctx: CanvasRenderingContext2D, mask: Coords): void;
  protected abstract applyPhysics(): void;

  setInitialPosition(position: Coords) {
    this.position = position;
  }
}
