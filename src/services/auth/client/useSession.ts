"use client";
import { createBrowserClient } from "@/services/supabase/browser";
import { useAction } from "@/shared/hooks";
import { useEffect } from "react";

export function useSession() {
  const supa = createBrowserClient();

  const { loading, data, error, execute } = useAction(supa.auth.getSession);

  useEffect(() => {
    execute(null);
  }, [execute]);

  return {
    loading,
    data,
    error,
  };
}
