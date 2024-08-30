"use client";

import { createContest } from "@/services/contest";
import { Button } from "@/shared/components";

const contest = {
  name: "FlagRush (Unranked) 2",
  time: { start: new Date("2024-08-29"), end: new Date("2024-08-31") },
  challenges: [
    {
      answer: "answer1",
      hints: [
        {
          afterSeconds: 60,
          cost: 100,
          id: 1,
          text: "C1H1: This is some hint that will be given to you during the challenge",
        },
        {
          afterSeconds: 100,
          cost: 100,
          id: 2,
          text: "C1H2: This is some hint that will be given to you during the challenge",
        },
        {
          afterSeconds: 150,
          cost: 100,
          id: 3,
          text: "C1H3: his is some hint that will be given to you during the challenge",
        },
      ],
      points: { max: 500, min: 50 },
      pointsDecayFactor: 0.5,
      description: "",
      name: "",
    },

    {
      answer: "answer2",
      hints: [
        {
          afterSeconds: 60,
          cost: 100,
          id: 1,
          text: "C2H1: This is some hint that will be given to you during the challenge",
        },
        {
          afterSeconds: 100,
          cost: 100,
          id: 2,
          text: "C2H2: This is some hint that will be given to you during the challenge",
        },
        {
          afterSeconds: 150,
          cost: 100,
          id: 3,
          text: "C2H3: This is some hint that will be given to you during the challenge",
        },
      ],
      points: { max: 500, min: 50 },
      pointsDecayFactor: 0.5,
      description: "",
      name: "",
    },

    {
      answer: "answer3",
      hints: [
        {
          afterSeconds: 60,
          cost: 100,
          id: 1,
          text: "C3H1: This is some hint that will be given to you during the challenge",
        },
        {
          afterSeconds: 100,
          cost: 100,
          id: 2,
          text: "C3H2: This is some hint that will be given to you during the challenge",
        },
        {
          afterSeconds: 150,
          cost: 100,
          id: 3,
          text: "C3H3: This is some hint that will be given to you during the challenge",
        },
      ],
      points: { max: 500, min: 50 },
      pointsDecayFactor: 0.5,
      description: "",
      name: "",
    },
  ],
  description: "",
  shortDescription:
    "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.",
};

export function CreateContest() {
  return <Button onClick={() => createContest(contest)}>Create Contest</Button>;
}
