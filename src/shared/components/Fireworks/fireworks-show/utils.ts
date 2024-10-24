export function randomReal(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function randomChance(probability: number = 0.5): boolean {
  return Math.random() > probability;
}

export function randomInt(min: number, max: number) {
  return Math.floor(randomReal(min, max));
}

export function randomItem<T>(items: Array<T>): T {
  return items[randomInt(0, items.length)];
}

export function pointDistance(x1: number, y1: number, x2: number, y2: number) {
  const distX = x2 - x1;
  const distY = y2 - y1;
  return Math.sqrt(distX * distX + distY * distY);
}

export function pointAngle(x1: number, y1: number, x2: number, y2: number) {
  return Math.PI / 2 + Math.atan2(y2 - y1, x2 - x1);
}
