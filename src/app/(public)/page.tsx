import { Logo } from "@/shared/components";
import { SignInWithEmail } from "./components/SignInWithEmail";
import { AnimatedNames } from "./components/AnimatedNames";
import { SvgAttribution, SvgGithub } from "@/assets/icons";
import Link from "next/link";

export default async function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center px-4">
      <header className="mx-auto mt-16 flex-shrink-0">
        <Logo size={1.5} />
        <AnimatedNames />
      </header>

      <div className="flex-grow py-28">
        <div className="text-center">
          <h2 className="text-4xl font-medium">Enter the Digital Crucible</h2>
          <p className="mt-2 text-xl">
            The arena is set, the challenges are exciting and the competition is
            fierce
          </p>
        </div>
        <div className="mx-auto mt-24 max-w-[400px] text-center">
          <SignInWithEmail />
        </div>
      </div>

      <footer className="w-full flex-shrink-0 py-4">
        <div className="flex flex-wrap items-center justify-center gap-5 text-sm leading-none text-slate-400 md:justify-start">
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
      </footer>
    </main>
  );
}
