export function joinNamesWithConjunction(
  items: Array<string>,
  conjunction: string = "and",
) {
  return [
    ...items.slice(0, items.length - 2),
    items.slice(items.length - 2).join(` ${conjunction} `),
  ].join(", ");
}

export function randomReal(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export function randomInt(min: number, max: number) {
  return Math.floor(randomReal(min, max));
}

export function randomItem<T>(items: Array<T>): T {
  return items[randomInt(0, items.length)];
}

export function intersection<T>(itemsA: Array<T>, itemsB: Array<T>): Array<T> {
  const sA = new Set(itemsA);
  return itemsB.filter((item) => sA.has(item));
}
