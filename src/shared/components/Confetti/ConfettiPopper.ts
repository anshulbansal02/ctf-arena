import { randomReal } from "@/lib/utils";
import { Particle } from "./particles/Particle";
import { ParticleFactory } from "./particles/ParticleFactory";

export class ConfettiPopper {
  private particles: Array<Particle> = [];
  private canvas: HTMLCanvasElement | null = null;
  private particleFactory = new ParticleFactory([
    { front: "#881337", back: "#f43f5e" },
    { front: "#ec4899", back: "#701a75" },
    { front: "#8b5cf6", back: "#4c1d95" },
    { front: "#3b82f6", back: "#1e3a8a" },
    { front: "#eab308", back: "#713f12" },
  ]);

  static makeStandardPopper(canvasSelector: string) {
    const popper = new ConfettiPopper();

    popper.canvas = document.querySelector(canvasSelector) as HTMLCanvasElement;

    popper.canvas.width = window.innerWidth;
    popper.canvas.height = window.innerHeight;

    const SequinCount = 20;
    const RibbonCount = 50;

    popper.particles = [
      ...new Array(RibbonCount)
        .fill(0)
        .map(() => popper.particleFactory.makeRandomRibbonParticle()),
      ...new Array(SequinCount)
        .fill(0)
        .map(() => popper.particleFactory.makeRandomSequinParticle()),
    ];

    return popper;
  }

  private count = 0;

  private renderFrame(render: Function) {
    if (this.count++ === 400) return;
    render();
    window.requestAnimationFrame(this.renderFrame.bind(this, render));
  }

  pop(origin: Coords) {
    if (!this.canvas)
      throw new Error("Canvas not provided to render confetti.");

    const ctx = this.canvas.getContext("2d")!;

    this.particles.forEach((particle) => {
      particle.setInitialPosition({
        x: randomReal(
          ctx.canvas.width / 2 - origin.x / 3,
          ctx.canvas.width / 2 + origin.x / 3,
        ),
        y: randomReal(
          ctx.canvas.height / 2 + origin.y / 2 + 8,
          ctx.canvas.height / 2 + 1.5 * origin.y - 8,
        ),
      });
    });

    this.renderFrame(() => {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

      this.particles.forEach((particle) => {
        particle.render(ctx, origin);
      });
    });
  }
}
