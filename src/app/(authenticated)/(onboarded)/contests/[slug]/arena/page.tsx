"use client";

import {
  checkAndCreateSubmission,
  getNextContestChallenge,
  getTeamContestStats,
} from "@/services/contest";
import { Button, Confetti, Input, Shim } from "@/shared/components";
import { useAction } from "@/shared/hooks";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { ScheduledHints } from "./components/ScheduledHints";

interface SubmissionForm {
  flag: string;
}

export default function SubmissionPage({
  params,
}: {
  params: { slug: number };
}) {
  const { execute: checkAndSubmitFlag, loading: checkingSubmission } =
    useAction(checkAndCreateSubmission);

  const {
    execute: getNextChallenge,
    loading: loadingNextChallenge,
    data: nextChallenge,
  } = useAction(getNextContestChallenge, {
    immediate: true,
    args: +params.slug,
  });

  const {
    execute: getTeamStats,
    loading: loadingTeamStats,
    data: teamStats,
  } = useAction(getTeamContestStats);

  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<SubmissionForm>({
    mode: "onSubmit",
  });

  useEffect(() => {
    getNextChallenge(params.slug);
  }, []);

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
        // Await for confetti to settle
        await new Promise((r) => setTimeout(r, 2000));
        getNextChallenge(params.slug);
        getTeamStats(params.slug);
      }
    };
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center">
      {nextChallenge ? (
        <ScheduledHints
          challengeId={nextChallenge.id}
          contestId={nextChallenge.contestId}
        />
      ) : null}

      <div className="">
        <h2 className="mb-4 mt-8 text-2xl font-medium">Your Team Stats</h2>
        <div>
          <div>{teamStats?.score}</div>
          <div>{teamStats?.lastSubmissionAt}</div>
          <div>{teamStats?.submissionsCount}</div>
        </div>
      </div>
      {loadingNextChallenge ? (
        <>
          <h2 className="mb-4 text-2xl font-medium">Loading Next Challenge</h2>
          <Shim classNames="w-full h-[200px]" />
        </>
      ) : (
        <>
          {" "}
          <h2 className="mb-4 mt-36 text-2xl font-medium">
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
                  Enter the flag you found without <kbd>Flag&#123; &#125;</kbd>.
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
  );
}
