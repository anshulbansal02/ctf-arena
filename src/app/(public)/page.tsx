import { Logo } from "@/shared/components";
import { SignInWithEmail } from "./components/SignInWithEmail";
import { AnimatedNames } from "./components/AnimatedNames";
import { SvgAttribution } from "@/assets/icons";

export default async function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center px-4">
      <header className="mt-16 flex w-full flex-col items-center">
        <Logo size={1.5} />
        <AnimatedNames />
      </header>
      <div className="mt-32 text-center">
        <h2 className="text-4xl font-medium">Enter the Digital Crucible</h2>
        <h4 className="mt-2 text-xl">
          The arena is set, the challenges are exciting and the competition is
          fierce
        </h4>
      </div>
      <div className="mt-24 text-center">
        <SignInWithEmail />
      </div>

      <a
        href="/attributions"
        className="fixed bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 text-sm font-medium text-slate-400"
      >
        <SvgAttribution fill="currentColor" />
        See Attributions
      </a>
    </main>
  );
}
