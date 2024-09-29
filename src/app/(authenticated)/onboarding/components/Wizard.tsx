"use client";

import { setUserOnboarded } from "@/services/auth";
import { useMemo, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";
import { CreateTeamStep } from "../../components/CreateTeam";
import { TeamingChoiceStep } from "./TeamingChoice";
import { JoinTeamStep } from "../../components/JoinTeam";
import { UserNameStep } from "./UserName";

interface Props {
  username: string;
}

export function OnboardingWizard(props: Props) {
  type Step = "name" | "choice" | "join" | "create";
  const [step, setStep] = useState<Step>(props.username ? "choice" : "name");

  async function handleChoice(choice: "choice" | "join" | "create" | "finish") {
    if (choice === "finish") await setUserOnboarded();
    else setStep(choice);
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
    name: <UserNameStep onNext={handleChoice} />,
    create: <CreateTeamStep onNext={handleChoice} onBack={handleBack} />,
    join: <JoinTeamStep onNext={handleChoice} onBack={handleBack} />,
    choice: (
      <TeamingChoiceStep userName={props.username} onNext={handleChoice} />
    ),
  }[step];

  return (
    <AnimatePresence mode="wait">
      <motion.div key={step} {...anime}>
        {Step}
      </motion.div>
    </AnimatePresence>
  );
}
