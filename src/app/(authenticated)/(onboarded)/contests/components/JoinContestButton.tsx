"use client";
import { joinContest } from "@/services/contest/services";
import { Button } from "@/shared/components";
import { useAction } from "@/shared/hooks";
import { useRouter } from "next/navigation";

interface Props {
  contestId: number;
}

export function JoinContestButton(props: Props) {
  const router = useRouter();

  const { execute: enterContest, loading } = useAction(async () => {
    await joinContest(props.contestId);
    router.refresh();
  });

  return (
    <Button loading={loading} onClick={enterContest}>
      Register For Contest
    </Button>
  );
}
