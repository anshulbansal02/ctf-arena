"use client";

import { SvgChevronLeft, SvgPenSparkle } from "@/assets/icons";
import { config } from "@/config";
import { createTeamAndSendInvites, generateTeamName } from "@/services/team";
import { Button, Input, TagsInput } from "@/shared/components";
import { useAction, useToaster } from "@/shared/hooks";
import clsx from "clsx";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import validator from "validator";

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
  const [teamInfoToast, setTeamInfoToast] = useState<{
    timer?: Timer;
    toastId?: number;
  }>({});

  const toaster = useToaster();

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<TeamDetails>({
    mode: "onSubmit",
  });

  const {
    execute: createTeam,
    loading,
    error,
  } = useAction(createTeamAndSendInvites);

  function handleNext(formData: TeamDetails) {
    switch (stage) {
      case "name":
        const timer = setTimeout(() => {
          const toastId = toaster.info({
            title: "A team can only have a maximum of 4 members.",
            content:
              "You can send out invites to only 5 users, the first 3 users to accept your invite become your team members.",
            persistent: true,
          });

          setTeamInfoToast((t) => ({ ...t, toastId }));
        }, 500);

        setTeamInfoToast((t) => ({ ...t, timer }));
        return setStage("invite");

      case "invite":
        createTeam({
          name: formData.name,
          invitees: formData.inviteIds,
        });
        return props.onNext("finish");
    }
  }

  const { execute: generateName, loading: settingName } = useAction(
    async () => {
      setValue("name", await generateTeamName());
    },
  );

  // Clean up info toast
  useEffect(() => {
    const { timer, toastId } = teamInfoToast;
    return () => {
      if (timer) clearTimeout(timer);
      if (toastId) toaster.dismiss(toastId);
    };
  }, [teamInfoToast]);

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
        onSubmit={handleSubmit(handleNext)}
      >
        <div>
          <label className="text-lg">Let&apos;s name it</label>
          <Input
            type="text"
            autoFocus
            disabled={settingName}
            className="mt-2 w-full"
            placeholder="How about Rangers?"
            {...register("name", {
              required: {
                message: "Please enter a name before proceeding",
                value: true,
              },
              minLength: {
                message: "Please enter a name with at least 3 characters",
                value: 3,
              },
            })}
            rightSlot={
              <Button
                type="button"
                variant="ghost"
                onClick={generateName}
                title="Generate a cool name"
              >
                <SvgPenSparkle
                  width={20}
                  height={20}
                  className={clsx({ "animate-pulse": settingName })}
                />
              </Button>
            }
          />
          <p className="mt-2 text-sm text-red-300">
            {formErrors.name?.message}
          </p>
        </div>

        {stage === "invite" && (
          <div className="mt-2">
            <label className="text-lg">Invite your team members</label>
            <Controller
              {...register("inviteIds", {
                validate: (emails) => {
                  const emailsValid = emails.every((e) => validator.isEmail(e));
                  if (!emailsValid) return "Please enter valid email addresses";
                  const orgsValid = emails.every((e) =>
                    config.app.organizations.includes(
                      e.split("@")[1].toLowerCase(),
                    ),
                  );
                  if (!orgsValid)
                    return "Cannot invite users outside of organization";
                  return true;
                },
              })}
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

            <p className="mt-2 text-sm text-red-300">
              {formErrors.inviteIds?.message}
            </p>

            <p className="mt-2 cursor-default text-xs leading-5 text-slate-400">
              Enter the email addresses of the users you would like to join your
              team.
              <br /> Press <kbd>,</kbd> or <kbd>Enter</kbd> after you type in
              the email address.
            </p>
          </div>
        )}

        <Button type="submit" className="mt-2" loading={loading}>
          {
            {
              name: "Next",
              invite: "Let's Go",
            }[stage]
          }
        </Button>
      </form>
    </div>
  );
}
