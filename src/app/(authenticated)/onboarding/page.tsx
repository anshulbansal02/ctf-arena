import { getAuthUser } from "@/services/auth";
import { OnboardingWizard } from "./components";
import { Header } from "../components/Header";

export default async function OnboardingPage() {
  const user = await getAuthUser();

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Header className="fixed top-0 z-10" />
      <section className="mt-[80px] max-w-[480px] px-4">
        <OnboardingWizard username={user.name} />
      </section>
    </main>
  );
}
