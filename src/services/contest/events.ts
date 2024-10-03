const events = {
  game: (contestId: number, eventName: string) =>
    `arena:contest:${contestId}:game:${eventName}`,
  leaderboard: (contestId: number, eventName: "update" | "win_claimed") =>
    `arena:contest:${contestId}:leaderboard:${eventName}`,
};

export default events;
