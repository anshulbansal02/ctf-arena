"use client";

import { SvgChevronLeft } from "@/assets/icons";
import { config } from "@/config";
import { joinNamesWithConjunction } from "@/lib/utils";
import { useTeams } from "@/services/team/browser/useTeams";
import { Button, Input, Shim } from "@/shared/components";
import { useToaster } from "@/shared/hooks";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  onNext: (choice: "finish") => void;
  onBack: () => void;
}

export function JoinTeamStep(props: Props) {
  const toaster = useToaster();
  const { teams, loading } = useTeams();
  const [joinRequestsDraft, setJoinRequestsDraft] = useState<Array<number>>([]);
  const [readyToFinish, setReadyToFinish] = useState(false);

  function toggleRequest(teamId: number) {
    if (
      !joinRequestsDraft.includes(teamId) &&
      joinRequestsDraft.length === config.team.REQUEST_TEAM_LIMIT
    ) {
      return toaster.error({
        title: `Can not request more than ${config.team.REQUEST_TEAM_LIMIT} teams at a time.`,
        content:
          "You can withdraw other requests to send request to other teams.",
        timeout: 5000,
      });
    }
    setJoinRequestsDraft((requests) => {
      return requests.includes(teamId)
        ? requests.filter((id) => id !== teamId)
        : [...requests, teamId];
    });
    setTimeout(() => {
      setReadyToFinish(true);
    }, 100);
  }

  return (
    <div className="mt-24 text-center">
      <div className="flex items-center justify-center gap-4">
        <Button onClick={props.onBack} variant="outlined">
          <SvgChevronLeft fill="#fff" />
        </Button>
        <h2 className="text-3xl">Choose your Team</h2>
      </div>
      <p className="mt-4 text-balance">
        You can only send request to {config.team.REQUEST_TEAM_LIMIT} teams at a
        time. First team to accept your request becomes your team.
      </p>
      <div className="mx-auto mt-8 flex flex-col items-center gap-4">
        <Input
          type="text"
          placeholder="Search with team name"
          className="w-full"
        />

        <ul className="mt-8 flex w-full list-none flex-col gap-6">
          {loading
            ? Array(4)
                .fill(0)
                .map((i) => (
                  <li key={i}>
                    <Shim classNames="w-full h-12" />
                  </li>
                ))
            : teams.map((team) => (
                <li
                  key={team.id}
                  className="flex items-center justify-between gap-8"
                >
                  <div className="text-left">
                    <h4 className="text-xl font-medium">{team.name}</h4>
                    <p>
                      {joinNamesWithConjunction(
                        team.members.map((m) => m.name!),
                      )}
                    </p>
                  </div>
                  <div>
                    <Button
                      onClick={() => toggleRequest(team.id)}
                      variant={
                        joinRequestsDraft.includes(team.id)
                          ? "ghost"
                          : "primary"
                      }
                    >
                      {joinRequestsDraft.includes(team.id)
                        ? "Withdraw Request"
                        : "Request To Join"}
                    </Button>
                  </div>
                </li>
              ))}
        </ul>
      </div>

      <AnimatePresence>
        {readyToFinish && (
          <motion.div
            className="fixed bottom-0 left-0 flex w-full justify-center"
            initial={{ y: 10, opacity: 0.2 }}
            transition={{ duration: 0.2 }}
            exit={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="absolute bottom-[-30px] mx-auto h-[100px] w-[400px] bg-teal-900 blur-2xl"></div>
            <Button className="mb-6 w-[320px]">Let&apos;s Go</Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
