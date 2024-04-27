"use client";
import { signOut } from "@/services/auth/browser";
import { Button } from "@/shared/components";
import { useAction } from "@/shared/hooks";
import { useRouter } from "next/navigation";

export function SignOutButton() {
  const router = useRouter();
  async function signOutWithRedirect() {
    await signOut();
    router.push("/");
  }

  const { execute, loading } = useAction(signOutWithRedirect);

  return (
    <Button variant="outlined" onClick={execute} loading={loading}>
      Sign Out
    </Button>
  );
}
