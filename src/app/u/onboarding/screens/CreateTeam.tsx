"use client";

import { SvgChevronLeft } from "@/assets/icons";
import { createTeamAndSendInvites } from "@/services/team/actions";
import { Button, Input, TagsInput } from "@/shared/components";
import { useAction, useToaster } from "@/shared/hooks";
import { FormEvent, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";

interface TeamDetails {
  name: string;
  inviteIds: Array<string>;
}

interface Props {
  onNext: (choice: "finish") => void;
  onBack: () => void;
}

export function CreateTeamStep(props: Props) {
  const [stage, setStage] = useState<"name" | "invite">("name");

  const { register, control, getValues } = useForm<TeamDetails>();
  const [teamInfoToast, setTeamInfoToast] = useState<{
    timer?: Timer;
    toastId?: number;
  }>({});

  const {
    execute: createTeam,
    loading,
    error,
  } = useAction(createTeamAndSendInvites);

  const toaster = useToaster();

  async function handleNext(e: FormEvent) {
    e.preventDefault();
    switch (stage) {
      case "name":
        const timer = setTimeout(() => {
          const toastId = toaster.info({
            content: "A team can only have a maximum of 4 members.",
            persistent: true,
          });

          setTeamInfoToast((t) => ({ ...t, toastId }));
        }, 500);

        setTeamInfoToast((t) => ({ ...t, timer }));
        return setStage("invite");
      case "invite":
        const formData = getValues();
        await createTeam({
          name: formData.name,
          invitees: formData.inviteIds,
        });
      // return props.onNext("finish");
    }
  }

  useEffect(() => {
    const { timer, toastId } = teamInfoToast;

    return () => {
      if (timer) clearTimeout(timer);
      if (toastId) toaster.dismiss(toastId);
    };
  }, [teamInfoToast, toaster]);

  const CTALabel = {
    name: "Next",
    invite: "Let's Go",
  }[stage];

  return (
    <div className="mt-36 min-w-[420px] text-center">
      <div className="flex items-center justify-center gap-4">
        <Button onClick={props.onBack} variant="outlined">
          <SvgChevronLeft fill="#fff" />
        </Button>
        <h2 className="text-3xl">Create your Team</h2>
      </div>
      <form
        className="mx-auto mt-8 flex flex-col gap-4 text-center"
        onSubmit={handleNext}
      >
        <div>
          <h4 className="text-lg">Let&apos;s name it</h4>
          <Input
            type="text"
            autoFocus
            className="mt-2 w-full"
            placeholder="How about Rangers?"
            {...register("name")}
          />
        </div>

        {stage === "invite" && (
          <div className="mt-2">
            <h4 className="text-lg">Invite your team members</h4>
            <Controller
              {...register("inviteIds")}
              control={control}
              render={({ field }) => (
                <TagsInput
                  {...field}
                  type="email"
                  className="mt-2 w-full"
                  autoFocus
                  placeholder="username@veersatech.com"
                />
              )}
            />

            <p className="mt-2  cursor-default text-xs text-slate-400">
              Enter the email addresses of the users you would like to join your
              team. You can send out invite to only 5 users.
            </p>
          </div>
        )}

        <Button
          onClick={handleNext}
          type="button"
          className="mt-2"
          loading={loading}
        >
          {CTALabel}
        </Button>
      </form>
    </div>
  );
}
