import { randomItem } from "@/lib/utils";

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
