import { Avatar } from "@/shared/components";
import Image, { StaticImageData } from "next/image";

import GoldMedal from "@/assets/media/gold-medal.png";
import SilverMedal from "@/assets/media/silver-medal.png";
import BronzeMedal from "@/assets/media/bronze-medal.png";

const medalURIs: Record<number, StaticImageData> = {
  1: GoldMedal,
  2: SilverMedal,
  3: BronzeMedal,
};

interface Props {
  data: Array<{
    team: string;
    challengesSolved: number;
    score: number;
    members: Array<number>;
  }>;
}

function Rank({ index }: { index: number }) {
  const rank = index + 1;
  if (rank > 3) return rank;

  return (
    <Image
      src={medalURIs[rank]}
      alt="Picture of the author"
      className="w-8"
      width={100}
      height={100}
    />
  );
}

function ProgressBar(props: { total: number; value: number }) {
  return (
    <div className="h-2 w-28 rounded-full bg-slate-800">
      <div
        className="h-full rounded-full bg-[#20b0b5]"
        style={{ width: (props.value / props.total) * 100 + "%" }}
      ></div>
    </div>
  );
}

export function MainLeaderboard(props: Props) {
  return (
    <div role="table" className="relative flex w-full flex-col gap-2">
      <div
        role="rowheader"
        className="flex gap-4 px-3 py-1 text-left text-base text-zinc-400"
      >
        <div role="cell" className="flex-1">
          &nbsp;
        </div>
        <div role="cell" className="flex-[4]">
          Team
        </div>
        <div role="cell" className="flex-[4]">
          Challenges Solved
        </div>
        <div role="cell" className="flex-1">
          Points
        </div>
      </div>
      <div className="no-scrollbar flex max-h-[560px] w-full flex-col gap-2 overflow-auto rounded-xl">
        {props.data.map((entry, i) => (
          <div
            role="row"
            className="flex items-center gap-4 rounded-e-xl rounded-s-xl bg-zinc-950 p-3"
          >
            <div role="cell" className="flex flex-1 justify-center">
              <Rank index={i} />
            </div>
            <div role="cell" className="flex flex-[4] items-center gap-2">
              <div className="flex items-center">
                {entry.members.map((id) => (
                  <Avatar
                    rounded
                    username={id}
                    size={20}
                    className="-ml-2 rounded-full border border-zinc-950 first:ml-0"
                  />
                ))}
              </div>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap text-nowrap">
                {entry.team}
              </div>
            </div>
            <div role="cell" className="flex flex-[4] items-center gap-2">
              <ProgressBar total={8} value={entry.challengesSolved} />
              <span className="text-sm text-zinc-400">
                {entry.challengesSolved}/8
              </span>
            </div>
            <div role="cell" className="flex-1 text-lg">
              {entry.score}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
