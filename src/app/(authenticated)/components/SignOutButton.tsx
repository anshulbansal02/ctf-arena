"use client";
import { SvgSignOut } from "@/assets/icons";
import { signOut } from "@/services/auth/client";
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
      <span className="hidden sm:block">Sign Out</span>
      <span className="sm:hidden">
        <SvgSignOut />
      </span>
    </Button>
  );
}
