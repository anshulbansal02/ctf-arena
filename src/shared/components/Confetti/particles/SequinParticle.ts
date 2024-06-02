import { Particle } from "./Particle";

export class SequinParticle extends Particle {
  radius: number;
  constants: { drag: number; gravity: number } = { drag: 0.02, gravity: 0.55 };

  constructor(init: { color: Color2D; velocity: Coords; radius: number }) {
    super(init);
    this.radius = init.radius;
  }

  render(ctx: CanvasRenderingContext2D, mask: Coords): void {
    if (!this.position)
      throw new Error(
        "Particle's initial position not set. Set by calling `setInitialPosition`",
      );

    // move canvas to position
    ctx.translate(this.position.x, this.position.y);

    // update sequin "physics" values
    this.applyPhysics();

    // set the color
    ctx.fillStyle = this.color.front;

    // draw sequin
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);
    ctx.fill();

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
    if (!this.position)
      throw new Error(
        "Particle's initial position not set. Set by calling `setInitialPosition`",
      );

    // apply forces to velocity
    this.velocity.x -= this.velocity.x * this.constants.drag;
    this.velocity.y = this.velocity.y + this.constants.gravity;

    // set position
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}
