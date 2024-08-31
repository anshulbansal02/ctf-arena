"use client";

import { createContest } from "@/services/contest";
import { Button } from "@/shared/components";
import { useAction, useToaster } from "@/shared/hooks";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const contestSchema = z.object({
  name: z.string(),
  time: z.object({ start: z.coerce.date(), end: z.coerce.date() }),
  challenges: z.array(
    z.object({
      answer: z.string(),
      hints: z.array(
        z.object({
          afterSeconds: z.number(),
          cost: z.number(),
          id: z.number(),
          text: z.string(),
        }),
      ),
      points: z.object({ max: z.number(), min: z.number() }),
      pointsDecayFactor: z.number(),
      description: z.string(),
      name: z.string(),
    }),
  ),
  description: z.string(),
  shortDescription: z.string(),
});

export function CreateContest() {
  const { execute: create, loading, success, data } = useAction(createContest);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors: formErrors },
  } = useForm<{ contestDetails: string }>({
    mode: "onSubmit",
  });

  const toaster = useToaster();

  async function handleFormSubmit(data: { contestDetails: string }) {
    const details = contestSchema.parse(JSON.parse(data.contestDetails));
    await create(details);
    setValue("contestDetails", "");
  }

  useEffect(() => {
    if (success) toaster.success(`Contest created with id:${data}`);
  }, [success]);

  function parseAndValidate(input: string) {
    try {
      const data = JSON.parse(input);
      const result = contestSchema.safeParse(data);
      if (result.error)
        return JSON.stringify(result.error.flatten().fieldErrors, null, 2);

      return true;
    } catch (e) {
      if (e instanceof Error) return e.message;
      return `${e}`;
    }
  }

  return (
    <div className="my-16 max-w-[600px]">
      <h5 className="text-center text-lg font-medium">Enter Contest Data</h5>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <textarea
          className="mt-4 min-h-96 w-[600px] rounded-lg bg-zinc-800 p-4"
          {...register("contestDetails", { validate: parseAndValidate })}
        />

        {formErrors.contestDetails?.message && (
          <p
            className="text-red-500"
            dangerouslySetInnerHTML={{
              __html: formErrors.contestDetails.message,
            }}
          ></p>
        )}

        <Button className="mt-4 w-full" loading={loading}>
          Create Contest
        </Button>
      </form>
    </div>
  );
}
