"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { config } from "@/config";
import { sendTeamInvites } from "@/services/team";
import { Button, TagsInput } from "@/shared/components";
import { useAction } from "@/shared/hooks";
import { Controller, useForm } from "react-hook-form";
import validator from "validator";
import { SvgCross } from "@/assets/icons";

type FormData = {
  members: Array<string>;
};

export function MembersInviteDialog() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<FormData>({
    mode: "onSubmit",
  });

  const { execute: sendInvites, loading } = useAction(sendTeamInvites);

  async function handleFormSubmit(data: FormData) {
    await sendInvites(data.members);
  }

  function validateEmails(emails: string[]) {
    if (!emails) return true;

    const emailsValid = emails.every((e) => validator.isEmail(e));
    if (!emailsValid) return "Please enter valid email addresses";

    const orgsValid = emails.every((e) =>
      config.app.organizations.includes(e.split("@")[1].toLowerCase()),
    );
    if (!orgsValid) return "Cannot invite users outside of organization";

    if (emails.length > new Set(emails).size)
      return "Cannot add an email address multiple times";

    return true;
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <Button variant="ghost">Invite Members</Button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black bg-opacity-30 backdrop-blur-md" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-[#26292e] p-8 shadow-lg">
          <Dialog.Close asChild>
            <Button
              variant="ghost"
              className="absolute right-2 top-2 !rounded-full"
            >
              <SvgCross width={18} height={18} fill="#ddd" />
            </Button>
          </Dialog.Close>

          <div className="max-h-[80vh] max-w-[480px]">
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="flex flex-col items-center text-center"
            >
              <div>
                <label className="text-xl font-medium">
                  Invite your team members
                </label>
                <Controller
                  {...register("members", { validate: validateEmails })}
                  control={control}
                  render={({ field }) => (
                    <TagsInput
                      {...field}
                      type="email"
                      className="mt-6 w-full"
                      autoFocus
                      placeholder="username@veersatech.com"
                    />
                  )}
                />

                <p className="mt-2 text-sm text-red-300">
                  {formErrors.members?.message}
                </p>

                <p className="mt-2 cursor-default text-xs leading-5 text-slate-400">
                  Enter the email addresses of the users you would like to join
                  your team.
                  <br /> Press <kbd>,</kbd> or <kbd>Enter</kbd> after you type
                  in the email address.
                </p>
              </div>

              <Button type="submit" className="mt-6 w-full" loading={loading}>
                Send Invites
              </Button>
            </form>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
