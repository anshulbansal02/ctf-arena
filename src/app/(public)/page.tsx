import { Logo } from "@/shared/components";
import { SignInWithEmail } from "./components/SignInWithEmail";
import { AnimatedNames } from "./components/AnimatedNames";
import { SvgAttribution, SvgGithub } from "@/assets/icons";
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

      <div className="fixed bottom-3 left-4 flex items-center gap-5 text-sm leading-none text-slate-400">
        <Link href="/privacy">Privacy Policy</Link>

        <Link href="/support">Support</Link>

        <Link href="/attributions" className="flex items-center gap-1">
          <SvgAttribution fill="currentColor" />
          See Attributions
        </Link>

        <Link
          href="https://github.com/anshulbansal02/ctf-arena"
          target="_blank"
          className="flex items-center gap-1"
        >
          <SvgGithub fill="currentColor" />
          Contribute
        </Link>
      </div>
    </main>
  );
}
