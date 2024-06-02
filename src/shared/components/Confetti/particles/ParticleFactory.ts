import { randomItem, randomReal } from "@/lib/utils";
import { RibbonParticle } from "./RibbonParticle";
import { SequinParticle } from "./SequinParticle";

export class ParticleFactory {
  constructor(private readonly colors: Array<Color2D>) {}

  private realisticRibbonVelocity = (
    xRange: [number, number],
    yRange: [number, number],
  ) => {
    const x = randomReal(xRange[0], xRange[1]);
    const range = yRange[1] - yRange[0] + 1;
    let y =
      yRange[1] - Math.abs(randomReal(0, range) + randomReal(0, range) - range);
    if (y >= yRange[1] - 1) {
      y += Math.random() < 0.25 ? randomReal(1, 3) : 0;
    }
    return { x: x, y: -y };
  };

  makeRandomRibbonParticle() {
    return new RibbonParticle({
      color: randomItem(this.colors),
      dimensions: { x: randomReal(5, 9), y: randomReal(8, 15) },
      scale: { x: 1, y: 1 },
      velocity: this.realisticRibbonVelocity([-9, 9], [6, 11]),
    });
  }

  makeRandomSequinParticle() {
    return new SequinParticle({
      color: randomItem(this.colors),
      radius: randomReal(1.5, 3),
      velocity: { x: randomReal(-6, 6), y: randomReal(-8, -12) },
    });
  }
}
