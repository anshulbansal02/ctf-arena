"use client";
import { createStore, Provider } from "jotai";

const globalStore = createStore();

export function GlobalStoreProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Provider store={globalStore}>{children}</Provider>;
}
