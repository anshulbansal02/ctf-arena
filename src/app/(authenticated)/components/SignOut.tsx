"use client";

import { SvgLogOut } from "@/assets/icons";
import { signOut } from "@/services/auth";
import { Button } from "@/shared/components";
import { useAction } from "@/shared/hooks";
import clsx from "clsx";
import { useSearchParams } from "next/navigation";

export function SignOut() {
  const params = useSearchParams();
  const shouldHide = params.get("mode") === "zen";

  const { execute, loading } = useAction(() =>
    signOut({ redirect: true, redirectTo: "/" }),
  );

  return (
    <Button
      variant="outlined"
      loading={loading}
      onClick={execute}
      className={clsx({ "!hidden": shouldHide })}
    >
      <span className="hidden sm:block">Sign Out</span>
      <span className="sm:hidden">
        <SvgLogOut />
      </span>
    </Button>
  );
}
