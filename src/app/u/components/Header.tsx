import { getUser } from "@/services/auth/server";
import { Avatar, Logo } from "@/shared/components";
import { SignOutButton } from "./SignOutButton";
import clsx from "clsx";

interface Props {
  className?: string;
}

export async function Header({ className }: Props) {
  const user = await getUser();

  return (
    <header
      className={clsx(
        "flex h-[80px] w-full items-center bg-[#17191C] p-4 shadow-lg sm:px-4 md:px-8 lg:px-16",
        className,
      )}
    >
      <div className="w-40"></div>
      <Logo className="flex-1" />

      <div className="flex w-40 justify-end gap-4">
        <Avatar size={40} username={user.id.split("-").at(-1)!} />

        <SignOutButton />
      </div>
    </header>
  );
}
