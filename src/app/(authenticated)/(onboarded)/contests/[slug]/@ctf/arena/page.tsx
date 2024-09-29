"use client";

import { getTeamContestStats } from "@/services/contest";
import {
  Button,
  Confetti,
  Input,
  ProgressBar,
  Shim,
  Spinner,
  Timer,
} from "@/shared/components";
import { useAction } from "@/shared/hooks";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { ScheduledHints } from "../../components/ScheduledHints";
import { randomItem } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import MountainImage from "@/assets/media/mountain.png";
import Image from "next/image";
import {
  checkAndCreateSubmission,
  getNextContestChallenge,
} from "@/services/contest/games/ctf";

interface SubmissionForm {
  flag: string;
}

const errorMessages = [
  "Incorrect flag. Please review and submit again.",
  "Sorry, that's not the correct flag.",
  "Not quite. Please check your flag and try again.",
  "That's not correct. Double-check your flag and try again.",
  "Incorrect. Don't worry, you can try again!",
  "That flag is incorrect. Give it another try!",
  "Wrong flag. Take a moment and try again!",
  "Incorrect flag, try again.",
  "That's not correct, please try again.",
  "Nope, that's not right. Try again!",
  "Incorrect, have another shot.",
  "Sorry, wrong flag. Try once more.",
  "Not correct, please try again.",
  "That's incorrect, try again.",
  "Incorrect, give it another try.",
  "No, that's not the flag. Try again.",
  "Wrong, but keep trying!",
  "Not quite, try again.",
  "Incorrect, have another go.",
  "Sorry, that's not it. Try again.",
  "Not the right flag, try again.",
  "Try again.",
  "Wrong answer.",
  "Incorrect flag.",
  "No. Not correct.",
  "Sorry, wrong answer.",
  "Incorrect. Try once more.",
];

interface CTFArenaProps {
  contest: {
    id: number;
    isUnranked: boolean | null;
    endsAt: Date;
    noOfChallenges: number;
  };
}

export default function CTFArena(props: CTFArenaProps) {
  const { execute: checkAndSubmitFlag, loading: checkingSubmission } =
    useAction(checkAndCreateSubmission);

  const [hasContestEnded, setContestEnded] = useState(false);

  const {
    execute: getNextChallenge,
    loading: loadingNextChallenge,
    data: nextChallenge,
  } = useAction(getNextContestChallenge, {
    immediate: true,
    args: props.contest.id,
  });

  const {
    execute: getTeamStats,
    loading: loadingTeamStats,
    data: teamStats,
  } = useAction(
    async (n: number) => {
      await new Promise((r) => setTimeout(r, 1000));
      return await getTeamContestStats(n);
    },
    { immediate: true, args: props.contest.id, preserveData: true },
  );

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors: formErrors },
  } = useForm<SubmissionForm>({
    mode: "onSubmit",
  });

  useEffect(() => {
    if (!hasContestEnded) {
      const interval = setInterval(() => getTeamStats(props.contest.id), 10000);
      return () => clearInterval(interval);
    }
  }, [hasContestEnded]);

  const submitButtonRef = useRef<HTMLButtonElement>(null);

  function handleFlagSubmission(next: Function) {
    return async (formData: SubmissionForm) => {
      const parsedAnswer =
        formData.flag.match(/^flag\{(\w+)\}$/i)?.[1] ?? formData.flag;

      const isCorrect = await checkAndSubmitFlag({
        challengeId: nextChallenge!.id,
        contestId: props.contest.id,
        submission: parsedAnswer,
      });
      if (isCorrect) {
        next();
        getTeamStats(props.contest.id);
        setValue("flag", "");
        // Await for confetti to settle
        await new Promise((r) => setTimeout(r, 2000));

        getNextChallenge(props.contest.id);
      } else {
        setError("flag", { message: randomItem(errorMessages) });
      }
    };
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center">
      <>
        <div className="fixed left-6 top-5 z-20 rounded-md bg-slate-700 px-4 py-2 shadow-md">
          <span className="font-mono text-lg font-semibold">
            <Timer
              till={props.contest.endsAt}
              running
              onUp={() => setContestEnded(true)}
            />
          </span>
        </div>

        {nextChallenge ? (
          <ScheduledHints
            challengeId={nextChallenge.id}
            contestId={nextChallenge.contestId}
          />
        ) : null}

        <div className="w-full max-w-[420px]">
          <h2 className="mb-4 mt-8 text-center text-2xl font-medium">
            Your Team Stats
          </h2>
          {!loadingTeamStats && !teamStats ? (
            <div>No stats to show</div>
          ) : (
            <div className="relative rounded-xl bg-[#202123] p-4">
              {loadingTeamStats && (
                <Spinner
                  color="white"
                  size={12}
                  className="absolute right-4 top-4"
                />
              )}

              <div className="flex gap-2">
                <p className="rounded-md bg-[#31373c] p-1 px-2 text-lg leading-none">
                  Rank <span className="text-slate-500">|</span>{" "}
                  {teamStats?.rank != null ? teamStats.rank + 1 : "-"}
                </p>
                <p className="rounded-md bg-[#31373c] p-1 px-2 text-lg leading-none">
                  Score <span className="text-slate-500">|</span>{" "}
                  {teamStats?.score ?? "-"}
                </p>
              </div>

              <div>
                <div className="mt-4 flex justify-between">
                  <p>Solved</p>
                  <p>
                    {teamStats?.submissionsCount} /{" "}
                    {props.contest.noOfChallenges}
                  </p>
                </div>
                <ProgressBar
                  total={props.contest.noOfChallenges}
                  value={teamStats?.submissionsCount ?? 0}
                />
              </div>

              <div className="mt-4">
                <p className="text-right text-sm text-slate-400">
                  {teamStats?.lastSubmissionAt
                    ? `Last submitted ${formatDistanceToNow(teamStats.lastSubmissionAt, { addSuffix: true })}`
                    : "Getting Team Stats"}
                </p>
              </div>
            </div>
          )}
        </div>

        {loadingNextChallenge ? (
          <div className="w-full max-w-[420px]">
            <h2 className="mb-4 mt-16 text-center text-2xl font-medium">
              Loading Next Challenge
            </h2>
            <Shim classNames="w-full h-[200px]" />
          </div>
        ) : nextChallenge ? (
          <div className="w-full max-w-[400px]">
            <h2 className="mt-16 text-center text-2xl font-medium">
              Submit Challenge Flag
            </h2>

            <p className="mb-4 mt-2 text-center text-lg">
              {nextChallenge.description}
            </p>

            <Confetti
              render={(launch) => (
                <form
                  className="w-full"
                  onSubmit={handleSubmit(
                    handleFlagSubmission(
                      launch.bind(null, submitButtonRef.current!),
                    ),
                  )}
                >
                  <Input
                    {...register("flag", {
                      required: {
                        message: "Please type in the flag before submitting.",
                        value: true,
                      },
                    })}
                    disabled={hasContestEnded}
                    className="w-full"
                    placeholder="Flag{                                                              }"
                  />
                  <p className="mt-2 text-center text-sm text-red-300">
                    {hasContestEnded
                      ? "Contest has ended"
                      : formErrors.flag?.message}
                  </p>
                  <p className="mt-2 cursor-default text-center text-xs leading-5 text-slate-400">
                    Enter the flag you found without{" "}
                    <kbd>Flag&#123; &#125;</kbd>.
                    <br />
                    For e.g. Flag&#123;Arena&#125; will be entered as Arena or
                    arena.
                  </p>
                  <Button
                    className="mt-4 w-full"
                    loading={checkingSubmission}
                    ref={submitButtonRef}
                  >
                    Submit
                  </Button>
                </form>
              )}
            />
          </div>
        ) : (
          <div className="mt-16 w-full max-w-[400px]">
            <Image
              src={MountainImage}
              alt="Mountain Peak"
              width={120}
              height={120}
              className="mx-auto opacity-60 invert"
            />
            <h2 className="mt-6 text-center text-lg font-medium">
              WooHoo! You have reached the peak by solving all the challenges.
            </h2>

            {!props.contest.isUnranked && (
              <>
                <p className="mt-2 text-center">
                  Enjoy the view or look how other teams are doing on
                  leaderboard
                </p>
                <Button
                  as="link"
                  href="leaderboard"
                  variant="outlined"
                  className="mt-4"
                >
                  View Leaderboard
                </Button>
              </>
            )}
          </div>
        )}
      </>
    </div>
  );
}
