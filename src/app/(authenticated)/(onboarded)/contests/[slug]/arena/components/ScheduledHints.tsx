import {
  getChallengeHints,
  getTeamLastSubmissionAt,
  revealHint,
} from "@/services/contest";
import { useScheduledTasks, useToaster } from "@/shared/hooks";
import { useEffect, useState } from "react";

interface Props {
  challengeId: number;
  contestId: number;
}

function RevealableHint(props: {
  number: number;
  hiddenText: string;
  originalText?: string;
  cost: number;
  reveal: (n: number) => void;
}) {
  return (
    <div>
      <h5>Hint #{props.number}</h5>
      <p>{props.originalText ?? props.hiddenText}</p>
      <p>Reveal hint for {props.cost} points.</p>
      <button onClick={() => props.reveal(props.number)}>Reveal</button>
    </div>
  );
}

export function ScheduledHints(props: Props) {
  const [hints, setHints] = useState<{
    list: Array<{
      text: string;
      cost: number;
      afterSeconds: number;
    }>;
    lastSubmissionAt: Date | null;
  }>({ list: [], lastSubmissionAt: null });

  const toaster = useToaster();

  async function getRevealedHint(n: number) {
    revealHint;
  }

  useEffect(() => {
    (async () => {
      const [hints, lastSubmissionAt] = await Promise.all([
        getChallengeHints(props.challengeId),
        getTeamLastSubmissionAt(props.contestId),
      ]);

      setHints({ list: hints, lastSubmissionAt });
    })();
  }, [props.challengeId]);

  useScheduledTasks(
    hints.list.map((hint, i) => ({
      action: () => {
        toaster.toast({
          content: (
            <RevealableHint
              cost={hint.cost}
              hiddenText={hint.text}
              number={i + 1}
              reveal={getRevealedHint}
            />
          ),
          scoped: true,
          persistent: true,
        });
      },
      timeout: hint.afterSeconds * 1000,
    })),
    [hints],
  );

  return null;
}
