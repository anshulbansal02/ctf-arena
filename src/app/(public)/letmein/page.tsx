"use client";
import { redirect } from "next/navigation";
import { useEffect, useRef } from "react";

export default function LetMeIn({
  searchParams,
}: {
  searchParams: { token: string; identifier: string };
}) {
  const { token, identifier } = searchParams;
  if (!(identifier && token)) redirect("/");

  const ref = useRef<HTMLFormElement>(null);

  useEffect(() => {
    ref.current?.submit();
  }, []);

  return (
    <form
      ref={ref}
      className="grid h-screen w-screen place-items-center"
      method="GET"
      action="/api/auth/callback/magic-link"
    >
      <div>
        <h1>Authenticating as {identifier}</h1>
        <input name="token" value={token} readOnly hidden></input>
        <input name="email" value={identifier} readOnly hidden></input>
      </div>
    </form>
  );
}
