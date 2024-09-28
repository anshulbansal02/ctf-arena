"use client";

import { signIn } from "@/services/auth";
import { Button, Input } from "@/shared/components";
import { useAction } from "@/shared/hooks";

export function SignInWithEmail() {
  const { execute, loading } = useAction(() => signIn("magic-link"));

  return (
    <>
      <Input type="email" placeholder="username@veersatech.com" />
      <Button
        type="submit"
        loading={loading}
        onClick={() => execute(null)}
        className="mt-2"
      >
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
        Send Magic Link
      </Button>
    </>
  );
}
