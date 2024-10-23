import { COLOR_CODES_W_INVISIBLE, INVISIBLE } from "./colors";
import { config } from "./config";
import { Spark, Star } from "./flash";
import { render } from "./renderer";

mainStage.addEventListener("ticker", update);

let currentFrame = 0;
let speedBarOpacity = 0;
let autoLaunchTime = 0;

function update(frameTime: number, lag: number) {
  if (config.isRunning) return;

  const timeStep = frameTime * config.simSpeed;
  const speed = config.simSpeed * lag;

  const starDrag = 1 - (1 - Star.airDrag) * speed;
  const starDragHeavy = 1 - (1 - Star.airDragHeavy) * speed;
  const sparkDrag = 1 - (1 - Spark.airDrag) * speed;
  const gAcc = (timeStep / 1000) * GRAVITY;
  COLOR_CODES_W_INVISIBLE.forEach((color) => {
    // Stars
    const stars = Star.active[color];
    for (let i = stars.length - 1; i >= 0; i = i - 1) {
      const star = stars[i];
      // Only update each star once per frame. Since color can change, it's possible a star could update twice without this, leading to a "jump".
      if (star.updateFrame === currentFrame) {
        continue;
      }
      star.updateFrame = currentFrame;

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
                Math.random() * star.sparkLifeVariation * star.sparkLife
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

  render(speed);
}
