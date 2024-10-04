export type TicketItem = number;
export type Ticket = TicketItem[][];
export type RuleChecker = (
  ticket: Ticket,
  markedItems: TicketItem[],
  drawnItems: TicketItem[],
) => { isValid: true; claimedItems: TicketItem[] } | { isValid: false };

export type TambolaGameState = {
  currentChallengeId: number;
  lastDrawnItem?: TicketItem;
  drawSequence: TicketItem[];
  itemsDrawn: TicketItem[];
};

export type TambolaChallengeConfig = {
  winningPatterns: Array<{
    totalClaims: number;
    name: string;
    points: number;
    title: string;
  }>;
};

export type UserChallengeState = {
  ticket: Ticket;
  claimedItems: TicketItem[];
};
