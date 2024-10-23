import { COLOR, INVISIBLE } from "./colors";
import { BurstFlash, createParticleArc, Spark, Star } from "./flash";

let quality = 1;
const q: "low" | "medium" | "high" = "high";

export function createBurst(
  count: number,
  particleFactory: (angle: number, ringSize: number) => void,
  startAngle = 0,
  arcLength = Math.PI * 2
) {
  const R = 0.5 * Math.sqrt(count / Math.PI);
  const C = 2 * R * Math.PI;
  const C_HALF = C / 2;
  const PI_2 = Math.PI * 2;

  for (let i = 0; i <= C_HALF; i++) {
    const ringAngle = ((i / C_HALF) * Math.PI) / 2;
    const ringSize = Math.cos(ringAngle);
    const partsPerFullRing = C * ringSize;
    const partsPerArc = partsPerFullRing * (arcLength / PI_2);

    const angleInc = PI_2 / partsPerFullRing;
    const angleOffset = Math.random() * angleInc + startAngle;
    // Each particle needs a bit of randomness to improve appearance.
    const maxRandomAngleOffset = angleInc * 0.33;

    for (let i = 0; i < partsPerArc; i++) {
      const randomAngleOffset = Math.random() * maxRandomAngleOffset;
      let angle = angleInc * i + angleOffset + randomAngleOffset;
      particleFactory(angle, ringSize);
    }
  }
}

export function crossetteEffect(star: Star) {
  const startAngle = (Math.random() * Math.PI) / 2;
  createParticleArc(startAngle, Math.PI * 2, 4, 0.5, (angle) => {
    Star.add(
      star.x,
      star.y,
      star.color,
      angle,
      Math.random() * 0.6 + 0.75,
      600
    );
  });
}

export function floralEffect(star: Star) {
  const count = 12 + 6 * quality;
  createBurst(count, (angle, speedMult) => {
    Star.add(
      star.x,
      star.y,
      star.color,
      angle,
      speedMult * 2.4,
      1000 + Math.random() * 300,
      star.speedX,
      star.speedY
    );
  });
  BurstFlash.add(star.x, star.y, 46);
}

export function fallingLeavesEffect(star: Star) {
  createBurst(7, (angle, speedMult) => {
    const newStar = Star.add(
      star.x,
      star.y,
      INVISIBLE,
      angle,
      speedMult * 2.4,
      2400 + Math.random() * 600,
      star.speedX,
      star.speedY
    );

    newStar.sparkColor = COLOR.Gold;
    newStar.sparkFreq = 144 / quality;
    newStar.sparkSpeed = 0.28;
    newStar.sparkLife = 750;
    newStar.sparkLifeVariation = 3.2;
  });
  // Queue burst flash render
  BurstFlash.add(star.x, star.y, 46);
}

// Crackle pops into a small cloud of golden sparks.
export function crackleEffect(star: Star) {
  const count = q === "high" ? 32 : 16;
  createParticleArc(0, Math.PI * 2, count, 1.8, (angle) => {
    Spark.add(
      star.x,
      star.y,
      COLOR.Gold,
      angle,
      Math.pow(Math.random(), 0.45) * 2.4,
      300 + Math.random() * 200
    );
  });
}
