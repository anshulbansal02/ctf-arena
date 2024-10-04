"use client";

import { SvgChevronLeft } from "@/assets/icons";
import { config } from "@/config";
import { joinNamesWithConjunction } from "@/lib/utils";
import { useTeams } from "@/services/team/client";
import { Button, Input, Shim } from "@/shared/components";
import { useAction, useToaster } from "@/shared/hooks";
import { AnimatePresence, motion } from "framer-motion";
import { nanoid } from "nanoid";
import { useState } from "react";
import AstronautImage from "@/assets/media/astronaut.png";
import Image from "next/image";
import { getSentTeamRequests, sendTeamRequests } from "@/services/team";
import { useForm } from "react-hook-form";

interface Props {
  onNext: (choice: "finish") => void;
  onBack: () => void;
}

const randomArray = Array(4).fill(0).map(nanoid);
const TeamsListSkeleton = () => {
  return randomArray.map((r) => (
    <li key={r} className={r}>
      <Shim classNames="w-full h-12" />
    </li>
  ));
};

export function JoinTeamStep(props: Props) {
  const [search, setSearch] = useState<string>("");
  const { teams, loading: loadingTeams } = useTeams({ search });
  const [joinRequestsDraft, setJoinRequestsDraft] = useState<Array<number>>([]);
  const [readyToFinish, setReadyToFinish] = useState(false);

  const {
    data: requestedTeams,
    execute: refetchRequestedTeams,
    loading: loadingRequestedTeams,
  } = useAction(
    async () => {
      const requests = await getSentTeamRequests();
      return requests.map((r) => r.teamId);
    },
    {
      args: [],
      immediate: true,
      preserveData: true,
    },
  );

  const loading = loadingTeams || loadingRequestedTeams;

  const { register, handleSubmit } = useForm<{ search: string }>({
    mode: "onSubmit",
  });

  function toggleRequest(teamId: number) {
    setJoinRequestsDraft((requests) => {
      return requests.includes(teamId)
        ? requests.filter((id) => id !== teamId)
        : [...requests, teamId];
    });
    setTimeout(() => {
      setReadyToFinish(true);
    }, 100);
  }

  const { execute: sendRequests, loading: sendingRequests } = useAction(
    async () => {
      await sendTeamRequests(joinRequestsDraft);
      await refetchRequestedTeams();
      props.onNext("finish");
    },
  );

  return (
    <div className="mt-20 text-center">
      <div className="flex items-center justify-center gap-4">
        <Button onClick={props.onBack} variant="outlined">
          <SvgChevronLeft fill="#fff" />
        </Button>
        <h2 className="text-3xl">Choose your Team</h2>
      </div>
      <p className="mt-4">
        You can only send request to {config.app.team.REQUEST_TEAM_DAY_LIMIT}{" "}
        teams in a day. First team to accept your request becomes your team.
        Requests are not withdrawable once sent.
      </p>
      <div className="mx-auto mt-8 flex flex-col items-center gap-4">
        <form
          onSubmit={handleSubmit(({ search }) => setSearch(search))}
          className="w-full"
        >
          <Input
            {...register("search")}
            type="search"
            placeholder="Search with team name"
          />
        </form>

        <ul className="mt-8 flex w-full list-none flex-col gap-6">
          {loading ? (
            <TeamsListSkeleton />
          ) : (
            teams.map((team) => (
              <li
                key={team.id}
                className="flex items-center justify-between gap-8"
              >
                <div className="text-left">
                  <h4 className="text-xl font-medium">{team.name}</h4>
                  <p>
                    {joinNamesWithConjunction(team.members.map((m) => m.name!))}
                  </p>
                </div>
                <div>
                  <Button
                    onClick={() => toggleRequest(team.id)}
                    disabled={requestedTeams?.includes(team.id)}
                    variant={
                      requestedTeams?.includes(team.id)
                        ? "ghost"
                        : joinRequestsDraft.includes(team.id)
                          ? "outlined"
                          : "primary"
                    }
                  >
                    {requestedTeams?.includes(team.id)
                      ? "Requested"
                      : joinRequestsDraft.includes(team.id)
                        ? "Remove Request"
                        : "Add Request"}
                  </Button>
                </div>
              </li>
            ))
          )}

          {!loading && teams.length === 0 ? (
            <li>
              <Image
                src={AstronautImage}
                alt="Astronaut in empty space"
                className="mx-auto opacity-50 invert"
                width={100}
                height={100}
              />
              <h4 className="mt-8 text-lg font-medium text-gray-200">
                So Empty... No Teams Found
              </h4>
              <p className="mt-2 leading-tight text-gray-400">
                You can wait for others to create teams or you can create your
                own by going back.
              </p>
            </li>
          ) : null}
        </ul>
      </div>

      <AnimatePresence>
        {readyToFinish && (
          <motion.div
            className="fixed bottom-0 left-0 z-40 flex w-full justify-center"
            initial={{ y: 10, opacity: 0.2 }}
            transition={{ duration: 0.2 }}
            exit={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            <div className="absolute bottom-[-30px] mx-auto h-[100px] w-[400px] bg-teal-900 blur-2xl"></div>
            <Button
              className="mb-6 w-[320px]"
              onClick={sendRequests}
              loading={sendingRequests}
            >
              Send & Let&apos;s Go
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
