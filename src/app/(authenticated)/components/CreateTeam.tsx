"use client";

import clsx from "clsx";
import validator from "validator";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { SvgChevronLeft, SvgPenSparkle } from "@/assets/icons";
import { config } from "@/config";
import { createTeamAndSendInvites, generateTeamName } from "@/services/team";
import { Button, Input, TagsInput } from "@/shared/components";
import { useAction, useToaster } from "@/shared/hooks";

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
  const [teamInfoToastTimer, setTeamInfoToastTimer] = useState<Timer>();

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

  const { execute: createTeam, loading } = useAction(createTeamAndSendInvites);

  function validateEmails(emails: string[]) {
    if (!emails) return true;

    const emailsValid = emails.every((e) => validator.isEmail(e));
    if (!emailsValid) return "Please enter valid email addresses";

    const orgsValid = emails.every((e) =>
      config.app.org.domains.includes(e.split("@")[1].toLowerCase()),
    );
    if (!orgsValid) return "Cannot invite users outside of organization";

    if (emails.length > new Set(emails).size)
      return "Cannot add an email address multiple times";

    return true;
  }

  async function handleNext(formData: TeamDetails) {
    switch (stage) {
      case "name":
        const timer = setTimeout(() => {
          toaster.info({
            title: "A team can only have a maximum of 4 members.",
            content:
              "You can send out invites to only 5 users, the first 3 users to accept your invite become your team members.",
            persistent: true,
            scoped: true,
          });
        }, 500);

        setTeamInfoToastTimer(timer);
        return setStage("invite");

      case "invite":
        const result = await createTeam({
          name: formData.name,
          invitees: formData.inviteIds,
        });
        if (!result?.error) return props.onNext("finish");
    }
  }

  const { execute: generateName, loading: settingName } = useAction(
    async () => {
      setValue("name", await generateTeamName());
    },
  );

  // Clean up info toast
  useEffect(() => {
    return () => {
      clearTimeout(teamInfoToastTimer);
    };
  }, [teamInfoToastTimer]);

  return (
    <div className="mt-20 text-center">
      <div className="flex items-center justify-center gap-4">
        <Button onClick={props.onBack} variant="outlined">
          <SvgChevronLeft fill="#fff" />
        </Button>
        <h2 className="text-3xl">Create your Team</h2>
      </div>
      <form
        className="mt-8 flex flex-col gap-4 text-center"
        onSubmit={handleSubmit(handleNext)}
      >
        <div>
          <label className="text-lg">Let&apos;s name it</label>
          <Input
            type="text"
            autoFocus
            disabled={settingName}
            className={clsx({ "animate-pulse": settingName }, "mt-2 w-full")}
            placeholder={"What would you call your team?"}
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
                className="m-1 !h-8 !w-8 !p-0"
                title="Generate a cool name"
              >
                <SvgPenSparkle width={20} height={20} />
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
              {...register("inviteIds", { validate: validateEmails })}
              control={control}
              render={({ field }) => (
                <TagsInput
                  {...field}
                  type="email"
                  className="mt-2 w-full"
                  autoFocus
                  placeholder="username@organization.com"
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
