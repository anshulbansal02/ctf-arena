"use client";

import { SvgEmailSent, SvgInfoOutlined } from "@/assets/icons";
import { config } from "@/config";
import { signIn } from "@/services/auth";
import { Button, Input } from "@/shared/components";
import { useAction, useToaster } from "@/shared/hooks";
import { useForm } from "react-hook-form";

export function SignInWithEmail() {
  const toaster = useToaster();

  const { execute, loading } = useAction(async (email: string) => {
    await signIn("magic-link", { email, redirect: false });
    toaster.success({
      icon: <SvgEmailSent fill="currentColor" />,
      title: "Authentication Request Sent",
      content: `An email has been sent to ${email} with a magic link. Use it to authenticate on CTF Arena. Do not share it with anyone.`,
      timeout: 20 * 1000,
    });
  });

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<{ email: string }>({
    mode: "onSubmit",
  });

  function validateEmail(email: string) {
    const isOrganizationProvidedEmail = config.app.organizations.some((org) =>
      email?.endsWith(`@${org}`),
    );
    if (!isOrganizationProvidedEmail)
      return "You can only use organization provided email address";

    return true;
  }

  return (
    <form onSubmit={handleSubmit((data) => execute(data.email))}>
      <Input
        type="email"
        placeholder="username@veersatech.com"
        disabled={loading}
        {...register("email", { required: true, validate: validateEmail })}
      />
      <p className="mt-2 text-sm text-red-300">{formErrors.email?.message}</p>
      <p className="flex cursor-default items-center justify-center gap-1 text-sm text-slate-400">
        <SvgInfoOutlined fill="currentColor" />
        Enter your Veersa email address to sign in with magic link
      </p>
      <Button type="submit" loading={loading} className="mt-4 w-full">
        Sign In
      </Button>
    </form>
  );
}
