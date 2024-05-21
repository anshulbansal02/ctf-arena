export function joinNamesWithConjunction(
  items: Array<string>,
  conjunction: string = "and",
) {
  return [
    ...items.slice(0, items.length - 2),
    items.slice(items.length - 2).join(` ${conjunction} `),
  ].join(", ");
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

export function randomItem<T>(items: Array<T> | string): T | string {
  return items[getRandomInt(0, items.length)];
}
