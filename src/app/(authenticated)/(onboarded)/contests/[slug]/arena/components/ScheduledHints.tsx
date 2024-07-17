import {
  getChallengeHints,
  getTeamLastSubmissionAt,
  revealHint,
} from "@/services/contest";
import { Button, Shim } from "@/shared/components";
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
  id: number;
  reveal: (n: number) => void;
}) {
  const [show, setShow] = useState(false);

  const contentToShow = show ? (
    props.text ? (
      <p className="my-2">{props.text}</p>
    ) : (
      <Shim classNames="w-full h-6" />
    )
  ) : (
    <p className="my-2 blur-sm">{props.hiddenText}</p>
  );
  const isAlreadyRevealed = Boolean(props.text);

  function toggle() {
    if (!isAlreadyRevealed) {
      props.reveal(props.id);
    }
    setShow(!show);
  }

  return (
    <div>
      <h5 className="text-xs font-semibold">Hint #{props.number}</h5>
      {contentToShow}
      {!isAlreadyRevealed ? (
        <p className="mb-2 text-sm italic text-amber-300">
          Reveal hint for {props.cost} points.
        </p>
      ) : null}
      <Button variant="outlined" className="p-2" onClick={toggle}>
        {show ? "Hide" : "Reveal"}
      </Button>
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

  const { execute: getRevealedHint } = useAction(async (id: number) => {
    const hint = await revealHint(props.challengeId, id);
    if (!hint) return;

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
      const [fetchedHints, lastSubmissionAt] = await Promise.all([
        getChallengeHints(props.challengeId),
        getTeamLastSubmissionAt(props.contestId),
      ]);

      setHints({
        list: fetchedHints,
        lastSubmissionAt: new Date(lastSubmissionAt),
      });
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
              id={hint.id}
              number={i + 1}
              reveal={getRevealedHint}
            />
          ),
          scoped: true,
          persistent: true,
          dismissible: false,
        });
      },
      timeout: hint.afterSeconds * 1000,
    })),
    [hints],
  );

  return null;
}
