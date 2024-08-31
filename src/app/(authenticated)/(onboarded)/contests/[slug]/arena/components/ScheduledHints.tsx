import { SvgBulb } from "@/assets/icons";
import {
  getChallengeHints,
  getTeamLastSubmissionAt,
  revealHint,
} from "@/services/contest";
import { Button } from "@/shared/components";
import { useAction, useScheduledTasks, useToaster } from "@/shared/hooks";
import clsx from "clsx";
import { useEffect, useState } from "react";

interface Props {
  challengeId: number;
  contestId: number;
}

function RevealableHint(props: {
  challengeId: number;
  number: number;
  hiddenText: string;
  text: string | null;
  cost: number;
  id: number;
}) {
  const [show, setShow] = useState(false);

  const {
    execute: getRevealedHint,
    data: revealedHint,
    loading,
  } = useAction(async () => revealHint(props.challengeId, props.id));

  const revealedHintText = revealedHint?.text ?? props.text;

  function HintText() {
    if (show && revealedHintText)
      return <p className="my-2 tracking-tight">{revealedHintText}</p>;

    return (
      <p className={clsx("my-2 blur-sm", { "animate-pulse": loading })}>
        {props.hiddenText}
      </p>
    );
  }

  const isAlreadyRevealed = Boolean(props.text ?? revealedHint);

  function toggle() {
    if (!isAlreadyRevealed) {
      getRevealedHint(null);
    }
    setShow(!show);
  }

  return (
    <div className="w-96">
      <HintText />

      <div className="flex items-center">
        {!isAlreadyRevealed ? (
          <p className="inline-block rounded-md bg-[#5f360e] px-2 py-1 text-sm font-medium leading-none text-white">
            <span className="font-mono">💰</span> Revealing this hint will cost{" "}
            {props.cost} points
          </p>
        ) : null}
        <Button variant="ghost" className="ml-auto !h-8 !p-2" onClick={toggle}>
          {show ? "Hide" : !isAlreadyRevealed ? "Reveal" : "Show"}
        </Button>
      </div>
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

  // TODO: CHECK IF IT WILL WORK
  useAction(async () => {
    const [fetchedHints, lastSubmissionAt] = await Promise.all([
      getChallengeHints(props.challengeId),
      getTeamLastSubmissionAt(props.contestId),
    ]);

    return {
      list: fetchedHints,
      lastSubmissionAt: new Date(lastSubmissionAt),
    };
  });

  const toaster = useToaster();

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
        toaster.info({
          content: (
            <RevealableHint
              challengeId={props.challengeId}
              cost={hint.cost}
              hiddenText={hint.hiddenText}
              text={hint.text}
              id={hint.id}
              number={i + 1}
            />
          ),
          icon: <SvgBulb fill="currentColor" />,
          title: `Hint #${i + 1}`,
          scoped: true,
          persistent: true,
          dismissible: false,
        });
      },
      timeout: Math.max(
        hint.afterSeconds * 1000 -
          (Date.now() - +(hints.lastSubmissionAt ?? Date.now())),
        0,
      ),
    })),
    hints.list,
  );

  return null;
}
