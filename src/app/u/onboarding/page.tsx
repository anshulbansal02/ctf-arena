import { getUser } from "@/services/auth";
import { Header } from "../components";
import { OnboardingWizard } from "./screens";

export default async function OnboardingPage() {
  const user = await getUser();

  return (
    <main className="flex min-h-screen flex-col items-center">
      <Header className="fixed top-0 z-10" />
      <section className="mt-[80px] max-w-[480px] px-4">
        <OnboardingWizard username={user.user_metadata.full_name} />
      </section>
    </main>
  );
}
