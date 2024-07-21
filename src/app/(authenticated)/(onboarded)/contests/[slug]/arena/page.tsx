"use client";

import {
  checkAndCreateSubmission,
  getContest,
  getNextContestChallenge,
  getTeamContestStats,
} from "@/services/contest";
import {
  Button,
  Confetti,
  Input,
  ProgressBar,
  Shim,
  Spinner,
} from "@/shared/components";
import { useAction } from "@/shared/hooks";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { ScheduledHints } from "./components/ScheduledHints";
import { useRouter } from "next/navigation";
import { randomItem } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

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

export default function SubmissionPage({
  params,
}: {
  params: { slug: number };
}) {
  const { execute: checkAndSubmitFlag, loading: checkingSubmission } =
    useAction(checkAndCreateSubmission);

  const router = useRouter();

  const { loading: loadingContest, data: contest } = useAction(getContest, {
    immediate: true,
    args: params.slug,
  });

  const {
    execute: getNextChallenge,
    loading: loadingNextChallenge,
    data: nextChallenge,
  } = useAction(getNextContestChallenge, {
    immediate: true,
    args: params.slug,
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
    { immediate: true, args: params.slug },
  );

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors: formErrors },
  } = useForm<SubmissionForm>({
    mode: "onSubmit",
  });

  useEffect(() => {
    if (loadingContest) return;
    if (contest == null) return router.replace("/");
    if (contest.endsAt < new Date())
      return router.push(`/contests/${params.slug}/leaderboard`);
  }, [contest]);

  useEffect(() => {
    const interval = setInterval(() => getTeamStats(params.slug), 10000);
    return () => clearInterval(interval);
  }, []);

  const submitButtonRef = useRef<HTMLButtonElement>(null);

  function handleFlagSubmission(next: Function) {
    return async (formData: SubmissionForm) => {
      const parsedAnswer =
        formData.flag.match(/^flag\{(\w+)\}$/i)?.[1] ?? formData.flag;

      const isCorrect = await checkAndSubmitFlag({
        challengeId: nextChallenge!.id,
        contestId: params.slug,
        submission: parsedAnswer,
      });
      if (isCorrect) {
        next();
        getTeamStats(params.slug);
        // Await for confetti to settle
        await new Promise((r) => setTimeout(r, 2000));

        // Get the next challenge only if there is one to solve.
        // TeamStats show number of challenges solved by the team and is lagging by 1 because it is not updated yet
        if (contest!.noOfChallenges > (teamStats?.submissionsCount ?? 0) + 1)
          getNextChallenge(params.slug);
      } else {
        setError("flag", { message: randomItem(errorMessages) });
      }
    };
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center">
      {contest && (
        <div>
          {nextChallenge ? (
            <ScheduledHints
              challengeId={nextChallenge.id}
              contestId={nextChallenge.contestId}
            />
          ) : null}

          <div className="">
            <h2 className="mb-4 mt-8 text-2xl font-medium">Your Team Stats</h2>
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
                  <p className="rounded-md bg-[#31373c] p-1 leading-none">
                    Rank <span className="text-slate-500">|</span>{" "}
                    {teamStats?.rank ?? "-"}
                  </p>
                  <p className="rounded-md bg-[#31373c] p-1 leading-none">
                    Score <span className="text-slate-500">|</span>{" "}
                    {teamStats?.score ?? "-"}
                  </p>
                </div>

                <div>
                  <div className="mt-4 flex justify-between">
                    <p>Solved</p>
                    <p>
                      {teamStats?.submissionsCount} / {contest.noOfChallenges}
                    </p>
                  </div>
                  <ProgressBar
                    total={contest.noOfChallenges}
                    value={teamStats?.submissionsCount ?? 0}
                  />
                </div>

                <div className="mt-4">
                  <p className="text-right text-sm text-slate-400">
                    Last Submitted{" "}
                    {formatDistanceToNow(
                      teamStats?.lastSubmissionAt ?? new Date(),
                      {
                        addSuffix: true,
                      },
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>
          {loadingNextChallenge ? (
            <>
              <h2 className="mb-4 text-2xl font-medium">
                Loading Next Challenge
              </h2>
              <Shim classNames="w-full h-[200px]" />
            </>
          ) : (
            <>
              <h2 className="mb-4 mt-16 text-center text-2xl font-medium">
                Submit Challenge Flag
              </h2>
              <Confetti
                render={(launch) => (
                  <form
                    className="w-[360px] max-w-[360px]"
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
                      className="w-full"
                      placeholder="Flag{                                                              }"
                    />
                    <p className="mt-2 text-center text-sm text-red-300">
                      {formErrors.flag?.message}
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
            </>
          )}
        </div>
      )}
    </div>
  );
}
