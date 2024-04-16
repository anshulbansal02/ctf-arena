"use client";

import { SvgChevronLeft } from "@/assets/icons";
import { Button, Input, TagsInput } from "@/shared/components";
import { FormEvent, useState } from "react";
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

  const { register, control } = useForm<TeamDetails>();

  function handleNext(e: FormEvent) {
    e.preventDefault();
    switch (stage) {
      case "name":
        return setStage("invite");
      // case "invite":
      //   return props.onNext("finish");
    }
  }

  const CTALabel = {
    name: "Next",
    invite: "Let's Go",
  }[stage];

  return (
    <div className="mt-36 min-w-[420px] text-center">
      <div className="flex items-center justify-center gap-4">
        <button onClick={props.onBack}>
          <SvgChevronLeft fill="#fff" />
        </button>
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

            <p className="mt-1.5  cursor-default text-xs text-slate-400">
              Enter the email addresses of the members you would like to join
              your team. You can only invite 4 members to your team.
            </p>
          </div>
        )}

        <Button onClick={handleNext} type="button" className="mt-2">
          {CTALabel}
        </Button>
      </form>
    </div>
  );
}
