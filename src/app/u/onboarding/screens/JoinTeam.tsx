"use client";

import { SvgChevronLeft } from "@/assets/icons";
import { Button, Input } from "@/shared/components";
import { useState } from "react";

interface Props {
  onNext: (choice: "finish") => void;
  onBack: () => void;
}

export function JoinTeamStep(props: Props) {
  const [joinRequestsDraft, setJoinRequestsDraft] = useState<Array<string>>([]);

  const teams = [
    { id: 1, name: "Hermann Junctions", members: "Boehm, Prohaska and Hoppe" },
    { id: 2, name: "Hermann Junctions", members: "Boehm, Prohaska and Hoppe" },
    { id: 3, name: "Hermann Junctions", members: "Boehm, Prohaska and Hoppe" },
    { id: 4, name: "Hermann Junctions", members: "Boehm, Prohaska and Hoppe" },
  ];

  return (
    <div className="mt-24 text-center">
      <div className="flex items-center justify-center gap-4">
        <button onClick={props.onBack}>
          <SvgChevronLeft fill="#fff" />
        </button>
        <h2 className="text-3xl">Choose your Team</h2>
      </div>
      <p className="mt-4">
        You can only request 4 teams at a time. First team to accept your
        request becomes your team.
      </p>
      <div className="mx-auto mt-8 flex flex-col items-center gap-4">
        <Input
          type="text"
          placeholder="Search with team name"
          className="w-full"
        />

        <ul className="mt-8 flex w-full list-none flex-col gap-6">
          {teams.map((team) => (
            <li
              key={team.id}
              className="flex items-center justify-between gap-8"
            >
              <div className="text-left">
                <h4 className="text-xl font-medium">{team.name}</h4>
                <p>{team.members}</p>
              </div>
              <div>
                <Button>Request to Join</Button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
