import { SvgInfoOutlined } from "@/assets/icons";
import { signIn } from "@/services/auth";
import { Button, Logo } from "@/shared/components";

export default async function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center px-4">
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
        <form
          action={async () => {
            "use server";
            await signIn("microsoft-entra-id");
          }}
        >
          <Button type="submit">
            <svg
              width={16}
              viewBox="0 0 2499.6 2500"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M1187.9 1187.9H0V0h1187.9z" fill="#f1511b" />
              <path d="M2499.6 1187.9h-1188V0h1187.9v1187.9z" fill="#80cc28" />
              <path d="M1187.9 2500H0V1312.1h1187.9z" fill="#00adef" />
              <path d="M2499.6 2500h-1188V1312.1h1187.9V2500z" fill="#fbbc09" />
            </svg>
            Continue with Microsoft
          </Button>
        </form>

        <p className="mt-1.5 flex cursor-default items-center justify-center gap-1 text-sm text-slate-400">
          <SvgInfoOutlined fill="currentColor" /> Sign In with your Veersa
          Account
        </p>
      </div>
    </main>
  );
}
