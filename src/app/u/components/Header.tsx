import { getUser } from "@/services/auth/server";
import { Avatar, Logo } from "@/shared/components";
import { SignOutButton } from "./SignOutButton";

export async function Header() {
  const user = await getUser();

  return (
    <header className="flex h-[80px] w-full items-center p-4 sm:px-4 md:px-8 lg:px-16">
      <div className="w-40"></div>
      <Logo className="flex-1" />

      <div className="flex w-40 justify-end gap-4">
        <Avatar size={40} username={user.id.split("-").at(-1)!} />

        <SignOutButton />
      </div>
    </header>
  );
}
