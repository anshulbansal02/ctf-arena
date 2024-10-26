import { Stage } from "./stage";
import type { Coords, Dimensions } from "./types";
import { COLOR_CODES, COLOR_CODES_W_INVISIBLE, INVISIBLE } from "./colors";
import { config } from "./config";
import { BurstFlash, Spark, Star } from "./particle";
import { colorSky } from "./sky";
import { ShellFactory } from "./shell-factory";
import { sequences } from "./sequences";
import { randomInt } from "@/lib/utils";

export class FireworksShow {
  private stageContainer: HTMLElement;
  private mainStage: Stage;
  private trailsStage: Stage;

  private stage: Dimensions = { h: 0, w: 0 };

  private paused: boolean;
  private currentFrame = 0;

  autoTimer?: Timer;

  constructor(name: string) {
    const stageSelector = `.fireworks[data-name="${name}"]`;
    this.stageContainer = document.querySelector(stageSelector) as HTMLElement;
    this.mainStage = new Stage(`${stageSelector} canvas[data-stage="main"]`);
    this.trailsStage = new Stage(
      `${stageSelector} canvas[data-stage="trails"]`,
    );

    this.paused = true;

    this.mainStage.addEventListener("ticker", this.frame.bind(this));

    // Compute initial dimensions
    this.handleResize();
    window.addEventListener("resize", this.handleResize.bind(this));
  }

  pause() {
    this.paused = true;
  }

  resume() {
    this.paused = false;
  }

  startAuto() {
    if (this.autoTimer) return;

    const getNextSequence = () => {
      const randomness = Math.random();
      if (randomness < 0.8) return sequences.random;
      return sequences.randomTwo;
    };

    const infiniteSequence = () => {
      const seq = getNextSequence();
      seq(this.stage);
      this.autoTimer = setTimeout(infiniteSequence, randomInt(4000, 8000));
    };

   infiniteSequence()
  }
  stopAuto() {
    clearTimeout(this.autoTimer);
    this.autoTimer = undefined;
  }

  private handleResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Try to adopt screen size, heeding maximum sizes specified
    const containerW = Math.min(w, config.MAX_WIDTH);
    // On small screens, use full device height
    const containerH = w <= 420 ? h : Math.min(h, config.MAX_HEIGHT);

    this.mainStage.resize(containerW, containerH);
    this.trailsStage.resize(containerW, containerH);
    // Account for scale
    const scaleFactor = config.scaleFactor;
    this.stage.w = containerW / scaleFactor;
    this.stage.h = containerH / scaleFactor;
  }

  launchRandomShell(coords: Coords) {
    console.log("Launching random shell", coords.x, coords.y);
    // Get random shell from shell factory
    const shell = ShellFactory.getShell("random");
    const w = this.mainStage.width;
    const h = this.mainStage.height;

    shell.launch(coords.x / w, 1 - coords.y / h, this.stage);
  }

  launchSequence(name: keyof typeof sequences) {
    sequences[name](this.stage);
  }

  private frame(frameTime: number, lag: number) {
    if (this.paused) return;

    const timeStep = frameTime * config.simSpeed;
    const speed = config.simSpeed * lag;

    this.currentFrame++;

    const starDrag = 1 - (1 - Star.airDrag) * speed;
    const starDragHeavy = 1 - (1 - Star.airDragHeavy) * speed;
    const sparkDrag = 1 - (1 - Spark.airDrag) * speed;
    const gAcc = (timeStep / 1000) * config.GRAVITY;

    COLOR_CODES_W_INVISIBLE.forEach((color) => {
      // Stars
      const stars = Star.active[color];
      for (let i = stars.length - 1; i >= 0; i = i - 1) {
        const star = stars[i];
        // Only update each star once per frame. Since color can change, it's possible a star could update twice without this, leading to a "jump".
        if (star.updateFrame === this.currentFrame) {
          continue;
        }
        star.updateFrame = this.currentFrame;

        star.life -= timeStep;
        if (star.life <= 0) {
          stars.splice(i, 1);
          Star.returnInstance(star);
        } else {
          const burnRate = Math.pow(star.life / star.fullLife, 0.5);
          const burnRateInverse = 1 - burnRate;

          star.prevX = star.x;
          star.prevY = star.y;
          star.x += star.speedX * speed;
          star.y += star.speedY * speed;
          // Apply air drag if star isn't "heavy". The heavy property is used for the shell comets.
          if (!star.heavy) {
            star.speedX *= starDrag;
            star.speedY *= starDrag;
          } else {
            star.speedX *= starDragHeavy;
            star.speedY *= starDragHeavy;
          }
          star.speedY += gAcc;

          if (star.spinRadius) {
            star.spinAngle += star.spinSpeed * speed;
            star.x += Math.sin(star.spinAngle) * star.spinRadius * speed;
            star.y += Math.cos(star.spinAngle) * star.spinRadius * speed;
          }

          if (star.sparkFreq) {
            star.sparkTimer -= timeStep;
            while (star.sparkTimer < 0) {
              star.sparkTimer +=
                star.sparkFreq * 0.75 + star.sparkFreq * burnRateInverse * 4;
              Spark.add(
                star.x,
                star.y,
                star.sparkColor,
                Math.random() * Math.PI * 2,
                Math.random() * star.sparkSpeed * burnRate,
                star.sparkLife * 0.8 +
                  Math.random() * star.sparkLifeVariation * star.sparkLife,
              );
            }
          }

          // Handle star transitions
          if (star.life < star.transitionTime!) {
            if (star.secondColor && !star.colorChanged) {
              star.colorChanged = true;
              star.color = star.secondColor;
              stars.splice(i, 1);
              Star.active[star.secondColor].push(star);
              if (star.secondColor === INVISIBLE) {
                star.sparkFreq = 0;
              }
            }

            if (star.strobe) {
              // Strobes in the following pattern: on:off:off:on:off:off in increments of `strobeFreq` ms.
              star.visible = Math.floor(star.life / star.strobeFreq) % 3 === 0;
            }
          }
        }
      }

      // Sparks
      const sparks = Spark.active[color];
      for (let i = sparks.length - 1; i >= 0; i = i - 1) {
        const spark = sparks[i];
        spark.life -= timeStep;
        if (spark.life <= 0) {
          sparks.splice(i, 1);
          Spark.returnInstance(spark);
        } else {
          spark.prevX = spark.x;
          spark.prevY = spark.y;
          spark.x += spark.speedX * speed;
          spark.y += spark.speedY * speed;
          spark.speedX *= sparkDrag;
          spark.speedY *= sparkDrag;
          spark.speedY += gAcc;
        }
      }
    });

    this.render(speed);
  }

  private render(speed: number) {
    const { dpr } = this.mainStage;
    const width = this.stage.w;
    const height = this.stage.h;
    const trailsCtx = this.trailsStage.ctx;
    const mainCtx = this.mainStage.ctx;

    colorSky(this.stageContainer, speed);

    // Account for high DPI screens, and custom scale factor.
    const scaleFactor = config.scaleFactor;
    trailsCtx.scale(dpr * scaleFactor, dpr * scaleFactor);
    mainCtx.scale(dpr * scaleFactor, dpr * scaleFactor);

    trailsCtx.globalCompositeOperation = "source-over";
    trailsCtx.fillStyle = `rgba(0, 0, 0, ${0.175 * speed})`;
    trailsCtx.fillRect(0, 0, width, height);

    mainCtx.clearRect(0, 0, width, height);

    while (BurstFlash.active.length) {
      const bf = BurstFlash.active.pop();
      if (!bf) break;

      const burstGradient = trailsCtx.createRadialGradient(
        bf.x,
        bf.y,
        0,
        bf.x,
        bf.y,
        bf.radius,
      );
      burstGradient.addColorStop(0.024, "rgba(255, 255, 255, 1)");
      burstGradient.addColorStop(0.125, "rgba(255, 160, 20, 0.2)");
      burstGradient.addColorStop(0.32, "rgba(255, 140, 20, 0.11)");
      burstGradient.addColorStop(1, "rgba(255, 120, 20, 0)");
      trailsCtx.fillStyle = burstGradient;
      trailsCtx.fillRect(
        bf.x - bf.radius,
        bf.y - bf.radius,
        bf.radius * 2,
        bf.radius * 2,
      );

      BurstFlash.returnInstance(bf);
    }

    // Remaining drawing on trails canvas will use 'lighten' blend mode
    trailsCtx.globalCompositeOperation = "lighten";

    // Draw stars
    trailsCtx.lineWidth = Star.drawWidth;
    trailsCtx.lineCap = config.quality === "low" ? "square" : "round";
    mainCtx.strokeStyle = "#fff";
    mainCtx.lineWidth = 1;
    mainCtx.beginPath();
    COLOR_CODES.forEach((color) => {
      const stars = Star.active[color];
      trailsCtx.strokeStyle = color;
      trailsCtx.beginPath();
      stars.forEach((star) => {
        if (star.visible) {
          trailsCtx.moveTo(star.x, star.y);
          trailsCtx.lineTo(star.prevX, star.prevY);
          mainCtx.moveTo(star.x, star.y);
          mainCtx.lineTo(
            star.x - star.speedX * 1.6,
            star.y - star.speedY * 1.6,
          );
        }
      });
      trailsCtx.stroke();
    });
    mainCtx.stroke();

    // Draw sparks
    trailsCtx.lineWidth = Spark.drawWidth;
    trailsCtx.lineCap = "butt";
    COLOR_CODES.forEach((color) => {
      const sparks = Spark.active[color];
      trailsCtx.strokeStyle = color;
      trailsCtx.beginPath();
      sparks.forEach((spark) => {
        trailsCtx.moveTo(spark.x, spark.y);
        trailsCtx.lineTo(spark.prevX, spark.prevY);
      });
      trailsCtx.stroke();
    });

    trailsCtx.setTransform(1, 0, 0, 1, 0, 0);
    mainCtx.setTransform(1, 0, 0, 1, 0, 0);
  }
}
