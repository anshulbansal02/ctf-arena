import { isSubset } from "@/lib/utils";
import { RuleChecker, TicketItem } from "./types";

const Result = {
  Y: (claimedItems: TicketItem[]) => ({ isValid: true, claimedItems }),
  N: () => ({ isValid: false }) as const,
};

export const WinningPatterns: Record<string, RuleChecker> = {
  top_line: (ticket, marked, drawn) => {
    const topRow = ticket[0].filter(Boolean);
    if (!(isSubset(topRow, marked) && isSubset(topRow, drawn)))
      return Result.N();
    return Result.Y(topRow);
  },

  middle_line: (ticket, marked, drawn) => {
    const midRow = ticket[1].filter(Boolean);
    if (!(isSubset(midRow, marked) && isSubset(midRow, drawn)))
      return Result.N();
    return Result.Y(midRow);
  },

  bottom_line: (ticket, marked, drawn) => {
    const bottomRow = ticket[2].filter(Boolean);
    if (!(isSubset(bottomRow, marked) && isSubset(bottomRow, drawn)))
      return Result.N();
    return Result.Y(bottomRow);
  },

  corners: (ticket, marked, drawn) => {
    const topRow = ticket[0].filter(Boolean);
    const bottomRow = ticket[2].filter(Boolean);
    const corners = [
      topRow.at(0)!,
      topRow.at(-1)!,
      bottomRow.at(0)!,
      bottomRow.at(-1)!,
    ];
    if (!(isSubset(corners, marked) && isSubset(corners, drawn)))
      return Result.N();
    return Result.Y(bottomRow);
  },

  corners_with_star: (ticket, marked, drawn) => {
    const topRow = ticket[0].filter(Boolean);
    const bottomRow = ticket[2].filter(Boolean);
    const corners = [
      topRow.at(0)!,
      topRow.at(-1)!,
      bottomRow.at(0)!,
      bottomRow.at(-1)!,
    ];
    const centerNumber = ticket[1].filter(Boolean)[2];
    const patternNums = [...corners, centerNumber];
    if (!(isSubset(patternNums, marked) && isSubset(patternNums, drawn)))
      return Result.N();
    return Result.Y(bottomRow);
  },

  full_house: (ticket, marked, drawn) => {
    const allNums = ticket.flatMap((row) => row).filter(Boolean);
    if (!(isSubset(allNums, marked) && isSubset(allNums, drawn)))
      return Result.N();
    return Result.Y(allNums);
  },

  early_five: (_, marked, drawn) => {
    if (marked.length >= 5 && !isSubset(marked, drawn)) return Result.N();
    return Result.Y(marked);
  },

  early_seven: (_, marked, drawn) => {
    if (marked.length >= 7 && !isSubset(marked, drawn)) return Result.N();
    return Result.Y(marked);
  },

  center: (ticket, marked, drawn) => {
    const centerNumber = ticket[1].filter(Boolean)[2];
    if (!(isSubset([centerNumber], marked) && isSubset([centerNumber], drawn)))
      return Result.N();
    return Result.Y([centerNumber]);
  },
};
