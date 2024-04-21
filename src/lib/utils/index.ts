export function joinNamesWithConjunction(
  items: Array<string>,
  conjunction: string = "and",
) {
  return [
    ...items.slice(0, items.length - 2),
    items.slice(items.length - 2).join(` ${conjunction} `),
  ].join(", ");
}
