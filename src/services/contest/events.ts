const events = {
  game: (contestId: number, eventName: string) =>
    `contest:${contestId}:game:${eventName}`,
  leaderboard: (contestId: number, eventName: "update" | "win_claimed") =>
    `contest:${contestId}:leaderboard:${eventName}`,
};

export default events;
