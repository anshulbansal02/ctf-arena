import {
  getChallengeHints,
  getTeamLastSubmissionAt,
  revealHint,
} from "@/services/contest";
import { Shim } from "@/shared/components";
import { useAction, useScheduledTasks, useToaster } from "@/shared/hooks";
import { useEffect, useState } from "react";

interface Props {
  challengeId: number;
  contestId: number;
}

function RevealableHint(props: {
  number: number;
  hiddenText: string;
  text: string | null;
  cost: number;
  reveal: (n: number) => void;
}) {
  const [show, setShow] = useState(false);

  const contentToShow = show ? (
    props.text ? (
      <p>{props.text}</p>
    ) : (
      <Shim classNames="w-full h-6" />
    )
  ) : (
    <p>{props.hiddenText}</p>
  );
  const isAlreadyRevealed = Boolean(props.text);

  function toggle() {
    if (!isAlreadyRevealed) {
      props.reveal(props.number);
    }
    setShow(!show);
  }

  return (
    <div>
      <h5>Hint #{props.number}</h5>
      {contentToShow}
      {!isAlreadyRevealed ? <p>Reveal hint for {props.cost} points.</p> : null}
      <button onClick={toggle}>{show ? "Hide" : "Reveal"}</button>
    </div>
  );
}

export function ScheduledHints(props: Props) {
  const [hints, setHints] = useState<{
    list: Array<{
      text: string | null;
      hiddenText: string;
      cost: number;
      afterSeconds: number;
      id: number;
    }>;
    lastSubmissionAt: Date | null;
  }>({ list: [], lastSubmissionAt: null });

  const toaster = useToaster();

  const { execute: getRevealedHint } = useAction(async (n: number) => {
    const hint = await revealHint(props.challengeId, n);
    setHints({
      ...hints,
      list: hints.list.map((h) => {
        if (h.id === hint.id) h.text = hint.text;
        return h;
      }),
    });
  });

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
              hiddenText={hint.hiddenText}
              text={hint.text}
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
