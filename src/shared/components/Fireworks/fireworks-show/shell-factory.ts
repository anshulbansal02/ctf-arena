import {
  makePistilColor,
  randomColor,
  COLOR,
  whiteOrGold,
  INVISIBLE,
} from "./colors";
import { config } from "./config";
import { Shell } from "./shell";
import { randomChance, randomItem } from "./utils";

export class ShellFactory {
  static chrysanthemumShell = (size = 1) => {
    const glitter = randomChance(0.25);
    const singleColor = randomChance(0.72);
    const color = singleColor
      ? randomColor({ limitWhite: true })
      : ([randomColor(), randomColor({ notSame: true })] as
          | string
          | Array<string>);

    const pistil = singleColor && randomChance(0.42);
    const pistilColor = pistil && makePistilColor(color as string);
    const secondColor =
      singleColor && (randomChance(0.2) || color === COLOR.White)
        ? pistilColor ||
          randomColor({ notColor: color as string, limitWhite: true })
        : null;

    const streamers = !pistil && color !== COLOR.White && randomChance(0.42);
    let starDensity = glitter ? 1.1 : 1.25;

    if (config.quality === "low") starDensity *= 0.8;
    if (config.quality === "high") starDensity = 1.2;

    return {
      shellSize: size,
      spreadSize: 300 + size * 100,
      starLife: 900 + size * 200,
      starDensity,
      color: color as string,
      secondColor,
      glitter: glitter ? "light" : "",
      glitterColor: whiteOrGold(),
      pistil,
      pistilColor,
      streamers,
    };
  };

  static ghostShell = (size = 1) => {
    const shell = this.chrysanthemumShell(size);
    shell.starLife *= 1.5;
    let ghostColor = randomColor({ notColor: COLOR.White });
    shell.streamers = true;
    shell.color = INVISIBLE;
    shell.secondColor = ghostColor;
    shell.glitter = "";

    return shell;
  };

  static strobeShell = (size = 1) => {
    const color = randomColor({ limitWhite: true });
    return {
      shellSize: size,
      spreadSize: 280 + size * 92,
      starLife: 1100 + size * 200,
      starLifeVariation: 0.4,
      starDensity: 1.1,
      color,
      glitter: "light",
      glitterColor: COLOR.White,
      strobe: true,
      strobeColor: Math.random() < 0.5 ? COLOR.White : null,
      pistil: Math.random() < 0.5,
      pistilColor: makePistilColor(color),
    };
  };

  static palmShell = (size = 1) => {
    const color = randomColor();
    const thick = Math.random() < 0.5;
    return {
      shellSize: size,
      color,
      spreadSize: 250 + size * 75,
      starDensity: thick ? 0.15 : 0.4,
      starLife: 1800 + size * 200,
      glitter: thick ? "thick" : "heavy",
    };
  };

  static ringShell = (size = 1) => {
    const color = randomColor();
    const pistil = Math.random() < 0.75;
    return {
      shellSize: size,
      ring: true,
      color,
      spreadSize: 300 + size * 100,
      starLife: 900 + size * 200,
      starCount: 2.2 * Math.PI * 2 * (size + 1),
      pistil,
      pistilColor: makePistilColor(color),
      glitter: !pistil ? "light" : "",
      glitterColor: color === COLOR.Gold ? COLOR.Gold : COLOR.White,
      streamers: Math.random() < 0.3,
    };
  };

  static crossetteShell = (size = 1) => {
    const color = randomColor({ limitWhite: true });
    return {
      shellSize: size,
      spreadSize: 300 + size * 100,
      starLife: 750 + size * 160,
      starLifeVariation: 0.4,
      starDensity: 0.85,
      color,
      crossette: true,
      pistil: Math.random() < 0.5,
      pistilColor: makePistilColor(color),
    };
  };

  static floralShell = (size = 1) => ({
    shellSize: size,
    spreadSize: 300 + size * 120,
    starDensity: 0.12,
    starLife: 500 + size * 50,
    starLifeVariation: 0.5,
    color: (Math.random() < 0.65
      ? "random"
      : Math.random() < 0.15
        ? randomColor()
        : [randomColor(), randomColor({ notSame: true })]) as string,
    floral: true,
  });

  static fallingLeavesShell = (size = 1) => ({
    shellSize: size,
    color: INVISIBLE,
    spreadSize: 300 + size * 120,
    starDensity: 0.12,
    starLife: 500 + size * 50,
    starLifeVariation: 0.5,
    glitter: "medium",
    glitterColor: COLOR.Gold,
    fallingLeaves: true,
  });

  static willowShell = (size = 1) => ({
    shellSize: size,
    spreadSize: 300 + size * 100,
    starDensity: 0.6,
    starLife: 3000 + size * 300,
    glitter: "willow",
    glitterColor: COLOR.Gold,
    color: INVISIBLE,
  });

  static crackleShell = (size = 1) => {
    const color = Math.random() < 0.75 ? COLOR.Gold : randomColor();
    return {
      shellSize: size,
      spreadSize: 380 + size * 75,
      starDensity: config.quality === "low" ? 0.65 : 1,
      starLife: 600 + size * 100,
      starLifeVariation: 0.32,
      glitter: "light",
      glitterColor: COLOR.Gold,
      color,
      crackle: true,
      pistil: Math.random() < 0.65,
      pistilColor: makePistilColor(color),
    };
  };

  static horsetailShell = (size = 1) => {
    const color = randomColor();
    return {
      shellSize: size,
      horsetail: true,
      color,
      spreadSize: 250 + size * 38,
      starDensity: 0.9,
      starLife: 2500 + size * 300,
      glitter: "medium",
      glitterColor: Math.random() < 0.5 ? whiteOrGold() : color,
      strobe: color === COLOR.White,
    };
  };

  static variants = {
    chrysanthemum: this.chrysanthemumShell,
    crackle: this.crackleShell,
    crossette: this.crossetteShell,
    fallingLeaves: this.fallingLeavesShell,
    floral: this.floralShell,
    ghost: this.ghostShell,
    horsetail: this.horsetailShell,
    palm: this.palmShell,
    ring: this.ringShell,
    strobe: this.strobeShell,
    willow: this.willowShell,
  };

  static getShell(
    variant: keyof typeof this.variants | "random" | "fastShell",
    size?: number,
  ) {
    const fastShells = [
      "chrysanthemum",
      "crackle",
      "crossette",
      "ghost",
      "horsetail",
      "palm",
      "ring",
      "strobe",
    ];
    const shells = Object.values(this.variants);

    let shellConfig;

    if (variant === "fastShell") {
      const randomFastShellName = randomItem(
        fastShells,
      ) as keyof typeof this.variants;
      shellConfig = this.variants[randomFastShellName];
    } else if (variant === "random") shellConfig = randomItem(shells);
    else shellConfig = this.variants[variant];

    return new Shell(shellConfig(size));
  }
}

export function fitShellPositionInBoundsH(position: number) {
  const edge = 0.18;
  return (1 - edge * 2) * position + edge;
}

export function fitShellPositionInBoundsV(position: number) {
  return position * 0.75;
}

export function getRandomShellPosition() {
  return {
    x: fitShellPositionInBoundsH(Math.random()),
    y: fitShellPositionInBoundsV(Math.random()),
  };
}

export function getRandomShellSize() {
  const baseSize = config.shellBaseSize;
  const maxVariance = Math.min(2.5, baseSize);
  const variance = Math.random() * maxVariance;
  const size = baseSize - variance;
  const height = maxVariance === 0 ? Math.random() : 1 - variance / maxVariance;
  const centerOffset = Math.random() * (1 - height * 0.65) * 0.5;
  const x = Math.random() < 0.5 ? 0.5 - centerOffset : 0.5 + centerOffset;
  return {
    size,
    x: fitShellPositionInBoundsH(x),
    height: fitShellPositionInBoundsV(height),
  };
}
