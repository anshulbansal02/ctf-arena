import { addMinutes, format } from "date-fns";

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

export function randomChance(probability: number = 0.5): boolean {
  return Math.random() > probability;
}

export function intersection<T>(itemsA: Array<T>, itemsB: Array<T>): Array<T> {
  const sA = new Set(itemsA);
  return itemsB.filter((item) => sA.has(item));
}

export function popRandom<T>(items: Array<T>): T {
  const randomIndex = randomInt(0, items.length);
  const randomItem = items[randomIndex];
  items[randomIndex] = items[items.length - 1];
  items.pop();
  return randomItem;
}

export function jsonSafeParse<T>(payload: any) {
  try {
    return JSON.parse(payload) as T;
  } catch {
    return null;
  }
}

export function isSubset(of: number[], from: number[]) {
  const superset = new Set(from);
  return of.every((item) => superset.has(item));
}

export function generateShuffledRange(min: number, max: number): number[] {
  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  for (let i = range.length - 1; i > 0; i--) {
    const j = randomInt(0, i);
    [range[i], range[j]] = [range[j], range[i]];
  }
  return range;
}

export function submissionComparator(keyA: string, keyB: string) {
  return keyA.toLowerCase() === keyB.toLowerCase();
}

export function scrambleText(str: string) {
  const lowerAlpha = "abcdefghijklmnopqrstuvwxyz".split("");
  const upperAlpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const numbers = "0123456789".split("");

  return [...str]
    .map((c) => {
      if (/[a-z]/.test(c)) return randomItem(lowerAlpha);
      if (/[A-Z]/.test(c)) return randomItem(upperAlpha);
      if (/\d/.test(c)) return randomItem(numbers);
      return c;
    })
    .join("");
}

export function groupBy<K extends PropertyKey, T>(
  items: Array<T>,
  keySelector: (item: T, index: number) => K,
): Partial<Record<K, T[]>> {
  const group: Partial<Record<K, T[]>> = {};
  items.forEach((item, i) => {
    const key = keySelector(item, i);
    if (!group[key]) group[key] = [];
    group[key].push(item);
  });
  return group;
}

export function arrayToMap<K extends PropertyKey, T>(
  items: Array<T>,
  keySelector: (item: T, index: number) => K,
): Partial<Record<K, T>> {
  const map: Partial<Record<K, T>> = {};
  items.forEach((item, i) => {
    const key = keySelector(item, i);
    map[key] = item;
  });
  return map;
}

export function formatInUTC(time: Date, formatStr: string) {
  return format(addMinutes(time, time.getTimezoneOffset()), formatStr);
}

export function pointDistance(x1: number, y1: number, x2: number, y2: number) {
  const distX = x2 - x1;
  const distY = y2 - y1;
  return Math.sqrt(distX * distX + distY * distY);
}

export function pointAngle(x1: number, y1: number, x2: number, y2: number) {
  return Math.PI / 2 + Math.atan2(y2 - y1, x2 - x1);
}
