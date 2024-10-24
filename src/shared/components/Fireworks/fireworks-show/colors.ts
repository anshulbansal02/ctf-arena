import { randomChance, randomItem } from "@/lib/utils";

type RGB = { r: number; g: number; b: number };

export const COLOR = {
  Red: "#ff0043",
  Green: "#14fc56",
  Blue: "#1e7fff",
  Purple: "#e60aff",
  Gold: "#ffbf36",
  White: "#ffffff",
} as const;
export const INVISIBLE = "_INVISIBLE_";

const COLOR_NAMES = Object.keys(COLOR) as Array<keyof typeof COLOR>;
export const COLOR_CODES = COLOR_NAMES.map((colorName) => COLOR[colorName]);
export const COLOR_CODES_W_INVISIBLE = [...COLOR_CODES, INVISIBLE];

export const COLOR_TUPLES: Record<string, RGB> = {};
COLOR_CODES.forEach((hex) => {
  COLOR_TUPLES[hex] = {
    r: parseInt(hex.slice(1, 2), 16),
    g: parseInt(hex.slice(3, 2), 16),
    b: parseInt(hex.slice(5, 2), 16),
  };
});

export function randomColorSimple() {
  return randomItem(COLOR_CODES);
}

let lastColor: string;
export function randomColor(options?: {
  notSame?: boolean;
  notColor?: string;
  limitWhite?: boolean;
}) {
  let color = randomColorSimple();

  // limit the amount of white chosen randomly
  if (options?.limitWhite && color === COLOR.White && randomChance(0.6)) {
    color = randomColorSimple();
  }

  if (options?.notSame) {
    while (color === lastColor) {
      color = randomColorSimple();
    }
  } else if (options?.notColor) {
    while (color === options.notColor) {
      color = randomColorSimple();
    }
  }

  lastColor = color;
  return color;
}

export function whiteOrGold() {
  return randomChance(0.5) ? COLOR.Gold : COLOR.White;
}

export function makePistilColor(shellColor: string) {
  return shellColor === COLOR.White || shellColor === COLOR.Gold
    ? randomColor({ notColor: shellColor })
    : whiteOrGold();
}
