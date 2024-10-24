import { COLOR, INVISIBLE, randomColor } from "./colors";
import { config } from "./config";
import {
  crackleEffect,
  createBurst,
  crossetteEffect,
  fallingLeavesEffect,
  floralEffect,
} from "./effects";
import { BurstFlash, createParticleArc, Star } from "./particle";
import type { Dimensions } from "./types";
import {
  pointAngle,
  pointDistance,
  randomChance,
  randomReal,
} from "@/lib/utils";

export class Shell {
  starLifeVariation: number;
  color: string;
  glitterColor: string;
  starCount: number;
  starLife: number;
  spreadSize: number;
  horsetail?: boolean;
  glitter?: string;
  fallingLeaves?: boolean;
  crossette?: boolean;
  floral?: boolean;
  crackle?: boolean;
  secondColor?: string;
  strobe?: boolean;
  strobeFreq?: number;
  strobeColor?: string;
  ring?: boolean;
  pistil?: boolean;
  streamers?: boolean;
  pistilColor?: string;
  comet?: Star;

  constructor(options: {
    starLifeVariation?: number;
    color?: string;
    glitterColor?: string;
    starCount?: number;
    starDensity?: number;
    spreadSize: number;
    starLife: number;
    glitter?: string;
  }) {
    this.starLifeVariation = options.starLifeVariation || 0.125;
    this.color = options.color || randomColor();
    this.glitterColor = options.glitterColor || this.color;
    this.starLife = options.starLife;
    this.spreadSize = options.spreadSize;

    Object.assign(this, options);

    if (!options.starCount) {
      const density = options.starDensity || 1;
      const scaledSize = options.spreadSize / 54;
      this.starCount = Math.max(6, scaledSize * scaledSize * density);
    } else this.starCount = options.starCount;
  }

  launch(position: number, launchHeight: number, stage: Dimensions) {
    const width = stage.w;
    const height = stage.h;
    const hpad = 60;
    const vpad = 50;
    const minHeightPercent = 0.45;
    const minHeight = height - height * minHeightPercent;

    const launchX = position * (width - hpad * 2) + hpad;
    const launchY = height;
    const burstY = minHeight - launchHeight * (minHeight - vpad);

    const launchDistance = launchY - burstY;
    const launchVelocity = Math.pow(launchDistance * 0.04, 0.64);

    const comet = (this.comet = Star.add(
      launchX,
      launchY,
      typeof this.color === "string" && this.color !== "random"
        ? this.color
        : COLOR.White,
      Math.PI,
      launchVelocity * (this.horsetail ? 1.2 : 1),
      launchVelocity * (this.horsetail ? 100 : 400),
    ));

    // making comet "heavy" limits air drag
    comet.heavy = true;
    // comet spark trail
    comet.spinRadius = randomReal(0.32, 0.85);
    comet.sparkFreq = 32 / config.qualityMagnitude;
    if (config.quality === "high") comet.sparkFreq = 8;
    comet.sparkLife = 320;
    comet.sparkLifeVariation = 3;
    if (this.glitter === "willow" || this.fallingLeaves) {
      comet.sparkFreq = 20 / config.qualityMagnitude;
      comet.sparkSpeed = 0.5;
      comet.sparkLife = 500;
    }
    if (this.color === INVISIBLE) {
      comet.sparkColor = COLOR.Gold;
    }

    // Randomly make comet "burn out" a bit early.
    // This is disabled for horsetail shells, due to their very short airtime.
    if (randomChance(0.4) && !this.horsetail) {
      comet.secondColor = INVISIBLE;
      comet.transitionTime = Math.pow(Math.random(), 1.5) * 700 + 500;
    }

    comet.onDeath = (comet) => this.burst(comet.x, comet.y);
  }

  burst(x: number, y: number) {
    const speed = this.spreadSize / 96;

    let sparkLifeVariation = 0.25;

    let onDeath: (star: Star) => void;
    if (this.crossette) onDeath = crossetteEffect;
    if (this.crackle) onDeath = crackleEffect;
    if (this.floral) onDeath = floralEffect;
    if (this.fallingLeaves) onDeath = fallingLeavesEffect;

    let sparkFreq = 0,
      sparkSpeed = 0,
      sparkLife = 0;
    if (this.glitter === "light") {
      sparkFreq = 400;
      sparkSpeed = 0.3;
      sparkLife = 300;
      sparkLifeVariation = 2;
    } else if (this.glitter === "medium") {
      sparkFreq = 200;
      sparkSpeed = 0.44;
      sparkLife = 700;
      sparkLifeVariation = 2;
    } else if (this.glitter === "heavy") {
      sparkFreq = 80;
      sparkSpeed = 0.8;
      sparkLife = 1400;
      sparkLifeVariation = 2;
    } else if (this.glitter === "thick") {
      sparkFreq = 16;
      sparkSpeed = config.quality === "high" ? 1.65 : 1.5;
      sparkLife = 1400;
      sparkLifeVariation = 3;
    } else if (this.glitter === "streamer") {
      sparkFreq = 32;
      sparkSpeed = 1.05;
      sparkLife = 620;
      sparkLifeVariation = 2;
    } else if (this.glitter === "willow") {
      sparkFreq = 120;
      sparkSpeed = 0.34;
      sparkLife = 1400;
      sparkLifeVariation = 3.8;
    }
    // Apply qualityMagnitude to spark count
    sparkFreq = sparkFreq / config.qualityMagnitude;

    let color: string | null;

    const starFactory = (angle: number, speedMult: number) => {
      const standardInitialSpeed = this.spreadSize / 1800;

      const star = Star.add(
        x,
        y,
        color || randomColor(),
        angle,
        speedMult * speed,
        // add minor variation to star life
        this.starLife + Math.random() * this.starLife * this.starLifeVariation,
        this.horsetail ? this.comet && this.comet.speedX : 0,
        this.horsetail
          ? this.comet && this.comet.speedY
          : -standardInitialSpeed,
      );

      if (this.secondColor) {
        star.transitionTime = this.starLife * (Math.random() * 0.05 + 0.32);
        star.secondColor = this.secondColor;
      }

      if (this.strobe) {
        star.transitionTime = this.starLife * (Math.random() * 0.08 + 0.46);
        star.strobe = true;
        // How many milliseconds between switch of strobe state "tick". Note that the strobe pattern
        // is on:off:off, so this is the "on" duration, while the "off" duration is twice as long.
        star.strobeFreq = Math.random() * 20 + 40;
        if (this.strobeColor) {
          star.secondColor = this.strobeColor;
        }
      }

      star.onDeath = onDeath;

      if (this.glitter) {
        star.sparkFreq = sparkFreq;
        star.sparkSpeed = sparkSpeed;
        star.sparkLife = sparkLife;
        star.sparkLifeVariation = sparkLifeVariation;
        star.sparkColor = this.glitterColor;
        star.sparkTimer = Math.random() * star.sparkFreq;
      }
    };

    if (typeof this.color === "string") {
      if (this.color === "random") color = null;
      else color = this.color;

      // Rings have positional randomness, but are rotated randomly
      if (this.ring) {
        const ringStartAngle = Math.random() * Math.PI;
        const ringSquash = Math.pow(Math.random(), 2) * 0.85 + 0.15;

        createParticleArc(0, Math.PI * 2, this.starCount, 0, (angle) => {
          // Create a ring, squashed horizontally
          const initSpeedX = Math.sin(angle) * speed * ringSquash;
          const initSpeedY = Math.cos(angle) * speed;
          // Rotate ring
          const newSpeed = pointDistance(0, 0, initSpeedX, initSpeedY);
          const newAngle =
            pointAngle(0, 0, initSpeedX, initSpeedY) + ringStartAngle;
          const star = Star.add(
            x,
            y,
            color!,
            newAngle,
            // apply near cubic falloff to speed (places more particles towards outside)
            newSpeed, //speed,
            // add minor variation to star life
            this.starLife +
              Math.random() * this.starLife * this.starLifeVariation,
          );

          if (this.glitter) {
            star.sparkFreq = sparkFreq;
            star.sparkSpeed = sparkSpeed;
            star.sparkLife = sparkLife;
            star.sparkLifeVariation = sparkLifeVariation;
            star.sparkColor = this.glitterColor;
            star.sparkTimer = Math.random() * star.sparkFreq;
          }
        });
      }
      // Normal burst
      else {
        createBurst(this.starCount, starFactory);
      }
    } else if (Array.isArray(this.color)) {
      if (Math.random() < 0.5) {
        const start = Math.random() * Math.PI;
        const start2 = start + Math.PI;
        const arc = Math.PI;
        color = this.color[0];
        createBurst(this.starCount, starFactory, start, arc);
        color = this.color[1];
        createBurst(this.starCount, starFactory, start2, arc);
      } else {
        color = this.color[0];
        createBurst(this.starCount / 2, starFactory);
        color = this.color[1];
        createBurst(this.starCount / 2, starFactory);
      }
    } else {
      throw new Error(
        "Invalid shell color. Expected string or array of strings, but got: " +
          this.color,
      );
    }

    if (this.pistil) {
      const innerShell = new Shell({
        spreadSize: this.spreadSize * 0.5,
        starLife: this.starLife * 0.6,
        starLifeVariation: this.starLifeVariation,
        starDensity: 1.4,
        color: this.pistilColor,
        glitter: "light",
        glitterColor:
          this.pistilColor === COLOR.Gold ? COLOR.Gold : COLOR.White,
      });
      innerShell.burst(x, y);
    }

    if (this.streamers) {
      const innerShell = new Shell({
        spreadSize: this.spreadSize * 0.9,
        starLife: this.starLife * 0.8,
        starLifeVariation: this.starLifeVariation,
        starCount: Math.floor(Math.max(6, this.spreadSize / 45)),
        color: COLOR.White,
        glitter: "streamer",
      });
      innerShell.burst(x, y);
    }

    BurstFlash.add(x, y, this.spreadSize / 4);
  }
}
