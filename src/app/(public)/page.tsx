import { SvgInfoOutlined } from "@/assets/icons";
import { Logo } from "@/shared/components";
import { SignInWithAzure } from "./components";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4">
      <header className="mt-36">
        <Logo size={1.5} />
      </header>
      <div className="mt-20 text-center">
        <h2 className="text-4xl font-medium">
          The First Capture The Flag Challenge
        </h2>
        <h4 className="mt-2 text-xl">
          Cyber Puzzle Palace: Unlocking Digital Secrets
        </h4>
      </div>
      <div className="mt-24 text-center">
        <SignInWithAzure />

        <p className="mt-1.5 flex cursor-default items-center justify-center gap-1 text-xs text-slate-400">
          <SvgInfoOutlined fill="currentColor" /> Sign In with your Veersa
          Account
        </p>
      </div>
    </main>
  );
}
