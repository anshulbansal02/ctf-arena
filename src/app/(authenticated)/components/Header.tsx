import { getAuthUser } from "@/services/auth";
import { Avatar, Logo } from "@/shared/components";
import clsx from "clsx";
import React from "react";
import { Notifications } from "./Notifications";
import { SignOut } from "./SignOut";

interface Props {
  className?: string;
}

export async function Header({ className }: Props) {
  const user = await getAuthUser();

  return (
    <header
      className={clsx(
        "flex h-[80px] w-full items-center bg-[#212428] p-4 shadow-lg sm:px-4 md:px-8 lg:px-16",
        className,
      )}
    >
      <div className="w-60"></div>
      <Logo className="flex-shrink-[0.5] flex-grow" />

      <div className="flex w-60 justify-end gap-4">
        <Notifications />

        <Avatar size={40} username={user.email} />

        <SignOut />
      </div>
    </header>
  );
}
