import { config } from "./config";
import { ShellFactory, getRandomShellSize } from "./shell-factory";
import type { Dimensions } from "./types";
import { randomChance } from "@/lib/utils";

function seqRandomShell(stage: Dimensions) {
  const size = getRandomShellSize();
  const shell = ShellFactory.getShell("random", size.size);
  shell.launch(size.x, size.height, stage);

  let extraDelay = shell.starLife;
  if (shell.fallingLeaves) {
    extraDelay = 4600;
  }

  return 900 + Math.random() * 600 + extraDelay;
}

function seqTwoRandom(stage: Dimensions) {
  const size1 = getRandomShellSize();
  const size2 = getRandomShellSize();
  const shell1 = ShellFactory.getShell("random", size1.size);
  const shell2 = ShellFactory.getShell("random", size2.size);
  const leftOffset = Math.random() * 0.2 - 0.1;
  const rightOffset = Math.random() * 0.2 - 0.1;
  shell1.launch(0.3 + leftOffset, size1.height, stage);
  setTimeout(() => {
    shell2.launch(0.7 + rightOffset, size2.height, stage);
  }, 100);

  let extraDelay = Math.max(shell1.starLife, shell2.starLife);
  if (shell1.fallingLeaves || shell2.fallingLeaves) {
    extraDelay = 4600;
  }

  return 900 + Math.random() * 600 + extraDelay;
}

function seqTriple(stage: Dimensions) {
  const baseSize = config.shellBaseSize;
  const smallSize = Math.max(0, baseSize - 1.25);

  const offset = Math.random() * 0.08 - 0.04;
  const shell1 = ShellFactory.getShell("fastShell", baseSize);
  shell1.launch(0.5 + offset, 0.7, stage);

  const leftDelay = 1000 + Math.random() * 400;
  const rightDelay = 1000 + Math.random() * 400;

  setTimeout(() => {
    const offset = Math.random() * 0.08 - 0.04;
    const shell2 = ShellFactory.getShell("fastShell", smallSize);
    shell2.launch(0.2 + offset, 0.1, stage);
  }, leftDelay);

  setTimeout(() => {
    const offset = Math.random() * 0.08 - 0.04;
    const shell3 = ShellFactory.getShell("fastShell", smallSize);
    shell3.launch(0.8 + offset, 0.1, stage);
  }, rightDelay);

  return 4000;
}

function seqSmallBarrage(stage: Dimensions) {
  const barrageCount = 8;

  function launchShell(x: number) {
    const shell = ShellFactory.getShell("random");
    const height = (Math.cos(x * 5 * Math.PI + Math.PI / 2) + 1) / 2;
    shell.launch(x, height * 0.75, stage);
  }

  let count = 0;
  let delay = 0;
  while (count < barrageCount) {
    if (count === 0) {
      launchShell(0.5);
      count += 1;
    } else {
      const offset = (count + 1) / barrageCount / 2;
      const delayOffset = Math.random() * 30 + 30;
      setTimeout(() => {
        launchShell(0.5 + offset);
      }, delay);
      setTimeout(() => {
        launchShell(0.5 - offset);
      }, delay + delayOffset);
      count += 2;
    }
    delay += 200;
  }

  return 3400 + barrageCount * 120;
}

export const sequences = {
  random: seqRandomShell,
  randomTwo: seqTwoRandom,
  randomTriple: seqTriple,
  celebration: seqSmallBarrage,
  short: seqTriple,
};
