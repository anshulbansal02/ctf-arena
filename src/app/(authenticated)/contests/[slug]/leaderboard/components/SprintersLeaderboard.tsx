interface Props {
  data: Array<{
    team: string;
    challengesSolved: number;
  }>;
}

export function SprintersLeaderboard(props: Props) {
  return (
    <div role="table" className="mt-8 flex w-full flex-col gap-2">
      <div
        role="rowheader"
        className="flex gap-4 px-3 py-1 text-left text-base text-zinc-400"
      >
        <div role="cell" className="flex-[4]">
          Team
        </div>
        <div role="cell" className="flex-1">
          Solved
        </div>
      </div>

      <div className="no-scrollbar flex max-h-[360px] w-full flex-col gap-2 overflow-auto rounded-xl">
        {props.data.map((entry) => (
          <div
            role="row"
            className="flex items-center gap-4 rounded-e-xl rounded-s-xl bg-zinc-950 p-3"
          >
            <div role="cell" className="flex-[4]">
              {entry.team}
            </div>
            <div role="cell" className="flex-1">
              {entry.challengesSolved}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
