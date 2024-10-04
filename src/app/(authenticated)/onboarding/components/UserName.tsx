"use client";

import { config } from "@/config";
import { updateUserName } from "@/services/user";
import { Button, Input } from "@/shared/components";
import { useAction } from "@/shared/hooks";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

interface Props {
  onNext: (step: "choice" | "finish") => void;
}

export function UserNameStep(props: Props) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors: formErrors },
  } = useForm<{ name: string }>({
    mode: "onSubmit",
  });

  const action = useAction(async ({ name }: { name: string }) => {
    await updateUserName(name);
    router.refresh();
    const nextStep = config.app.onboarding.skipTeamingStep
      ? "finish"
      : "choice";
    props.onNext(nextStep);
  });

  return (
    <div className="mt-24 text-center">
      <h2 className="text-3xl font-normal">
        Hey! 👋 User
        <br /> What would you like us to call you?
      </h2>
      <form className="mt-16" onSubmit={handleSubmit(action.execute)}>
        <Input
          type="text"
          autoComplete="name"
          placeholder="Your Full Name"
          {...register("name", { required: true })}
        />
        <p className="mt-2 text-sm text-red-300">{formErrors.name?.message}</p>
        <Button type="submit" className="mt-4 w-full">
          Let&apos;s Go
        </Button>
      </form>
    </div>
  );
}
