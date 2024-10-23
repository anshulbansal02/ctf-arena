"use client";

export function useFireworks(opts: { name: string; auto?: boolean }) {
  const launch = (
    using: "pointer" | "sequence",
    sequenceName?: "celebration" | "short" | "showdown",
  ) => {
    if (using === "pointer") return (event: PointerEvent) => {};
    else if (using === "sequence") {
      // launch sequence
    }
  };

  return { launch };
}
