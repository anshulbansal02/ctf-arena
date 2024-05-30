"use client";
import { joinContest } from "@/services/contest/services";
import { Button } from "@/shared/components";
import { useAction } from "@/shared/hooks";

interface Props {
  contestId: number;
}

export function JoinContestButton(props: Props) {
  const { execute: enterContest, loading } = useAction(() =>
    joinContest(props.contestId),
  );

  return (
    <Button loading={loading} onClick={enterContest}>
      Enter Contest
    </Button>
  );
}
