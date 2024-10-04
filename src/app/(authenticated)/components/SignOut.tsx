"use client";

import { SvgLogOut } from "@/assets/icons";
import { signOut } from "@/services/auth";
import { Button } from "@/shared/components";
import { useAction } from "@/shared/hooks";

export function SignOut() {
  const { execute, loading } = useAction(() =>
    signOut({ redirect: true, redirectTo: "/" }),
  );

  return (
    <Button variant="outlined" loading={loading} onClick={execute}>
      <span className="hidden sm:block">Sign Out</span>
      <span className="sm:hidden">
        <SvgLogOut />
      </span>
    </Button>
  );
}
