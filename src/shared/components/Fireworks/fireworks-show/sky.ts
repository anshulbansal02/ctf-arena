import { COLOR_CODES, COLOR_TUPLES } from "./colors";
import { Star } from "./particle";

const currentSkyColor = { r: 0, g: 0, b: 0 };
const targetSkyColor = { r: 0, g: 0, b: 0 };
export function colorSky(canvasContainer: HTMLElement, speed: number) {
  const maxSkySaturation = 30;
  const maxStarCount = 500;
  let totalStarCount = 0;
  targetSkyColor.r = 0;
  targetSkyColor.g = 0;
  targetSkyColor.b = 0;

  COLOR_CODES.forEach((color) => {
    const tuple = COLOR_TUPLES[color];
    const count = Star.active[color].length;
    totalStarCount += count;
    targetSkyColor.r += tuple.r * count;
    targetSkyColor.g += tuple.g * count;
    targetSkyColor.b += tuple.b * count;
  });

  const intensity = Math.pow(Math.min(1, totalStarCount / maxStarCount), 0.3);
  const maxColorComponent = Math.max(
    1,
    targetSkyColor.r,
    targetSkyColor.g,
    targetSkyColor.b
  );

  // Scale all color components to a max of `maxSkySaturation`, and apply intensity.
  targetSkyColor.r =
    (targetSkyColor.r / maxColorComponent) * maxSkySaturation * intensity;
  targetSkyColor.g =
    (targetSkyColor.g / maxColorComponent) * maxSkySaturation * intensity;
  targetSkyColor.b =
    (targetSkyColor.b / maxColorComponent) * maxSkySaturation * intensity;

  // Animate changes to color to smooth out transitions.
  const colorChange = 10;
  currentSkyColor.r +=
    ((targetSkyColor.r - currentSkyColor.r) / colorChange) * speed;
  currentSkyColor.g +=
    ((targetSkyColor.g - currentSkyColor.g) / colorChange) * speed;
  currentSkyColor.b +=
    ((targetSkyColor.b - currentSkyColor.b) / colorChange) * speed;

  canvasContainer.style.backgroundColor = `rgb(${currentSkyColor.r | 0}, ${
    currentSkyColor.g | 0
  }, ${currentSkyColor.b | 0})`;
}
