"use client";

// import { checkAndCreateSubmission } from "@/services/contest/services";
import { Button, Confetti, Input } from "@/shared/components";
import { useAction, useScheduledTasks, useToaster } from "@/shared/hooks";
import { useRef } from "react";
import { useForm } from "react-hook-form";

interface SubmissionForm {
  flag: string;
}

export default function SubmissionPage() {
  const { execute: checkAndSubmitFlag, loading } = useAction(
    async () => await new Promise((r) => setTimeout(() => r(true), 2500)),
  );

  const submitButtonRef = useRef<HTMLButtonElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<SubmissionForm>({
    mode: "onSubmit",
  });

  function handleFlagSubmission(next: Function) {
    return async (formData: SubmissionForm) => {
      const isCorrect = await checkAndSubmitFlag({
        challengeId: 0,
        contestId: 0,
        submission: formData.flag,
      });
      if (isCorrect) next();
    };
  }

  // Fetch user's next challenge

  const toaster = useToaster();

  const hints = [
    {
      text: "Obscured hint Alias nemo magnam laudantium impedit dolore necessitatibus cupiditate eligendi.",
      after: 2,
    },
    {
      text: "Obscured hint Alias nemo magnam laudantium impedit dolore necessitatibus cupiditate eligendi.",
      after: 5,
    },
  ];

  // Schedule Hints
  useScheduledTasks(
    hints.map((hint) => ({
      action: () => {
        toaster.toast({ content: hint.text, scoped: true, persistent: true,  });
      },
      timeout: hint.after * 1000,
    })),
  );

  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center">
      <div className="">
        <h2 className="mb-4 mt-8 text-2xl font-medium">Your Team Stats</h2>
      </div>

      <h2 className="mb-4 mt-36 text-2xl font-medium">Submit A Flag</h2>
      <Confetti
        render={(launch) => (
          <form
            className="w-[360px] max-w-[360px]"
            onSubmit={handleSubmit(
              handleFlagSubmission(launch.bind(null, submitButtonRef.current!)),
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
              For e.g. Flag&#123;Arena&#125; will be entered as Arena or arena.
            </p>
            <Button
              className="mt-4 w-full"
              loading={loading}
              ref={submitButtonRef}
            >
              Submit
            </Button>
          </form>
        )}
      />
    </div>
  );
}
