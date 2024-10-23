import { COLOR_CODES } from "./colors";
import { config } from "./config";
import { BurstFlash, Spark, Star } from "./flash";
import { colorSky } from "./sky";

declare class Stage {
  public dpr: number;
  public ctx: CanvasRenderingContext2D;
  constructor(canvasSelector: string);
}

type Dimensions = {
  w: number;
  h: number;
};

const mainStage = new Stage("main");
const trailsStage = new Stage("trails");

export function render(
  speed: number,
  view: Dimensions,
  canvasContainer: HTMLElement
) {
  const { dpr } = mainStage;
  const width = view.w;
  const height = view.h;
  const trailsCtx = trailsStage.ctx;
  const mainCtx = mainStage.ctx;

  colorSky(canvasContainer, speed);

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
      bf.radius
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
      bf.radius * 2
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
        mainCtx.lineTo(star.x - star.speedX * 1.6, star.y - star.speedY * 1.6);
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
