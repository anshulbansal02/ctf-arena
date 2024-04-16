"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUserOnboarded } from "@/actions/auth";

import { CreateTeamStep } from "./CreateTeam";
import { JoinTeamStep } from "./JoinTeam";
import { FirstChoiceStep } from "./FirstChoice";

interface Props {
  username: string;
}

export function OnboardingWizard(props: Props) {
  type Step = "choice" | "join" | "create";
  const [step, setStep] = useState<Step>("choice");

  const router = useRouter();

  async function handleChoice(choice: "join" | "create" | "finish") {
    if (choice === "finish") {
      await setUserOnboarded();
      router.refresh();
    } else {
      setStep(choice);
    }
  }

  function handleBack() {
    setStep("choice");
  }

  switch (step) {
    case "create":
      return <CreateTeamStep onNext={handleChoice} onBack={handleBack} />;
    case "join":
      return <JoinTeamStep onNext={handleChoice} onBack={handleBack} />;
    default:
      return (
        <FirstChoiceStep userName={props.username} onNext={handleChoice} />
      );
  }
}
