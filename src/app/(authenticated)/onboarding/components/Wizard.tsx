"use client";

import { setUserOnboarded } from "@/services/auth";
import { useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { CreateTeamStep } from "../../components/CreateTeam";
import { FirstChoiceStep } from "./FirstChoice";
import { JoinTeamStep } from "../../components/JoinTeam";

interface Props {
  username: string;
}

export function OnboardingWizard(props: Props) {
  type Step = "choice" | "join" | "create";
  const [step, setStep] = useState<Step>("choice");

  async function handleChoice(choice: "join" | "create" | "finish") {
    if (choice === "finish") {
      await setUserOnboarded();
    } else {
      setStep(choice);
    }
  }

  function handleBack() {
    setStep("choice");
  }

  const anime = useMemo(() => {
    return {
      initial: { x: 5, opacity: 0 },
      animate: { x: 0, opacity: 1 },
      exit: { x: -5, opacity: 0 },
      transition: { duration: 0.1 },
    };
  }, []);

  const Step = {
    create: <CreateTeamStep onNext={handleChoice} onBack={handleBack} />,
    join: <JoinTeamStep onNext={handleChoice} onBack={handleBack} />,
    choice: <FirstChoiceStep userName={props.username} onNext={handleChoice} />,
  }[step];

  return (
    <AnimatePresence mode="wait">
      <motion.div key={step} {...anime}>
        {Step}
      </motion.div>
    </AnimatePresence>
  );
}
