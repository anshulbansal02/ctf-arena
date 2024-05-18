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

export function randomItem<T>(array: Array<T>): T {
  return array[getRandomInt(0, array.length)];
}

export function scrambleText(text: string): string {
  return "";
}
