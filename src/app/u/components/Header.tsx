import { Avatar, Logo } from "@/shared/components";
import { getUser } from "@/services/auth/server";

export async function Header() {
  const user = await getUser();

  return (
    <header className="flex h-[80px] w-full items-center p-4 px-16">
      <Logo className="flex-1" />

      <div>
        <Avatar size={40} username={user.id.split("-").at(-1)!} />
      </div>
    </header>
  );
}
