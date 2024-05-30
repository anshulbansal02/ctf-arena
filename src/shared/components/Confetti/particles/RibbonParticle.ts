import { Particle } from "./Particle";

export class RibbonParticle extends Particle {
  dimensions: Coords;
  scale: Coords;
  rotation: number;
  constants: { drag: number; gravity: number; terminalVelocity: number };
  randomness: number;

  constructor() {
    super();
    this.dimensions = { x: 0, y: 0 };
    this.scale = { x: 0, y: 0 };
    this.rotation = 0;
    this.constants = { drag: 0, gravity: 0, terminalVelocity: 0 };
    this.randomness = 0;
  }

  render(ctx: CanvasRenderingContext2D, mask: Coords): void {
    const width = this.dimensions.x * this.scale.x;
    const height = this.dimensions.y * this.scale.y;

    // move canvas to position and rotate
    ctx.translate(this.position.x, this.position.y);
    ctx.rotate(this.rotation);

    // update ribbon "physics" values
    this.applyPhysics();

    // get front or back fill color
    ctx.fillStyle = this.scale.y > 0 ? this.color.front : this.color.back;

    // draw ribbon
    ctx.fillRect(-width / 2, -height / 2, width, height);

    // reset transform matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // clear rectangle where button cuts off
    if (this.velocity.y < 0) {
      ctx.clearRect(
        ctx.canvas.width / 2 - mask.x / 2,
        ctx.canvas.height / 2 + mask.y / 2,
        mask.x,
        mask.y,
      );
    }
  }

  protected applyPhysics() {
    // apply forces to velocity
    this.velocity.x -= this.velocity.x * this.constants.drag;
    this.velocity.y = Math.min(
      this.velocity.y + this.constants.gravity,
      this.constants.terminalVelocity,
    );
    this.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();

    // set position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // spin confetto by scaling y and set the color, .09 just slows cosine frequency
    this.scale.y = Math.cos((this.position.y + this.randomness) * 0.09);
  }
}
