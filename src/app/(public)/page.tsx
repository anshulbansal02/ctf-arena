import { SvgInfoOutlined } from "@/assets/icons";
import { Logo } from "@/shared/components";
import { SignInWithMicrosoft } from "./components/SignInWithMicrosoft";

export default async function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center px-4">
      <header className="mt-36">
        <Logo size={1.5} />
      </header>
      <div className="mt-20 text-center">
        <h2 className="text-4xl font-medium">Enter the Digital Crucible</h2>
        <h4 className="mt-2 text-xl">
          The arena is set, the challenges are daunting and the competition is
          fierce.
        </h4>
      </div>
      <div className="mt-24 text-center">
        <SignInWithMicrosoft />

        <p className="mt-1.5 flex cursor-default items-center justify-center gap-1 text-sm text-slate-400">
          <SvgInfoOutlined fill="currentColor" /> Sign In with your Veersa
          Account
        </p>
      </div>
    </main>
  );
}
