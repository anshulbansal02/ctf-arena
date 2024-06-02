"use client";

import { Button, Confetti, Input } from "@/shared/components";
import { useState } from "react";

export default function SubmissionPage() {
  const [loading, setLoading] = useState(false);

  async function handleSubmission(next: Function) {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 2500));
    setLoading(false);
    next();
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center">
      <div className="">
        <h2>Team Stats</h2>
      </div>

      <h2 className="mb-4 mt-36 text-2xl font-medium">Submit A Flag</h2>
      <form className="w-[360px] max-w-[360px]">
        <Input
          className="w-full"
          placeholder="Flag{                                                                     }"
        />
        <Confetti
          render={(launch) => (
            <Button
              className="mt-4 w-full"
              onClick={(e) => {
                handleSubmission(() =>
                  launch(e.nativeEvent.target as HTMLElement),
                );
              }}
              loading={loading}
              type="button"
            >
              Submit
            </Button>
          )}
        />
      </form>
    </div>
  );
}
