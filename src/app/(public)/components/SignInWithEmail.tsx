"use client";

import { SvgEmailSent, SvgInfoOutlined } from "@/assets/icons";
import { config } from "@/config";
import { signIn } from "@/services/auth";
import { Button, Input, Tooltip } from "@/shared/components";
import { useAction, useToaster } from "@/shared/hooks";
import { useForm } from "react-hook-form";

export function SignInWithEmail() {
  const toaster = useToaster();

  const { execute, loading } = useAction(
    async ({ email }: { email: string }) => {
      await signIn("magic-link", { email, redirect: false });
      toaster.success({
        icon: <SvgEmailSent fill="currentColor" />,
        title: "Check your email",
        content: `An email has been sent to ${email} with a magic link (it may take a while to reach you). Use it to authenticate on CTF Arena. Do not share it with anyone.`,
        timeout: 20 * 1000,
      });
    },
  );

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<{ email: string }>({
    mode: "onSubmit",
  });

  function validateEmail(email: string) {
    const isOrganizationProvidedEmail = config.app.org.domains.some((org) =>
      email?.endsWith(`@${org}`),
    );
    if (!isOrganizationProvidedEmail)
      return "You can only use organization provided email address";

    return true;
  }

  return (
    <form onSubmit={handleSubmit(execute)}>
      <Input
        type="email"
        placeholder="username@organization.com"
        disabled={loading}
        className="min-w-96"
        rightSlot={
          <Tooltip
            text={`Enter your ${config.app.org.name} email address to sign in with a magic link`}
            className="grid h-10 w-10 place-items-center"
          >
            <SvgInfoOutlined fill="currentColor" />
          </Tooltip>
        }
        {...register("email", { required: true, validate: validateEmail })}
      />
      <p className="mt-2 text-sm text-red-300">{formErrors.email?.message}</p>

      <Button type="submit" loading={loading} className="mt-4 w-full">
        Sign In
      </Button>
    </form>
  );
}
