"use client";

import { SvgInfoOutlined } from "@/assets/icons";
import { config } from "@/config";
import { signIn } from "@/services/auth";
import { Button, Input } from "@/shared/components";
import { useAction } from "@/shared/hooks";
import { useForm } from "react-hook-form";

export function SignInWithEmail() {
  const { execute, loading } = useAction((email: string) =>
    signIn("magic-link", { email }),
  );

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
      <p className="mt-1.5 flex cursor-default items-center justify-center gap-1 text-sm text-slate-400">
        <SvgInfoOutlined fill="currentColor" />
        Use your Veersa email address to sign in with a magic link
      </p>
      <Button type="submit" loading={loading} className="mt-3 w-full">
        Send Magic Link
      </Button>
    </form>
  );
}
