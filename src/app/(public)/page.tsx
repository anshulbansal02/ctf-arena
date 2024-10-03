import { Logo } from "@/shared/components";
import { SignInWithEmail } from "./components/SignInWithEmail";
import { AnimatedNames } from "./components/AnimatedNames";
import { SvgAttribution } from "@/assets/icons";
import Link from "next/link";

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

      <Link
        href="/attributions"
        className="fixed bottom-0 right-0 flex items-center gap-1 bg-[#151619] bg-opacity-40 px-4 py-3 text-sm font-medium leading-none text-slate-300 backdrop-blur-lg"
      >
        <SvgAttribution fill="currentColor" />
        See Attributions
      </Link>
    </main>
  );
}
