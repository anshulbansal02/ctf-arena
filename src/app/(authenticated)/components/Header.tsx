import { getAuthUser, signOut } from "@/services/auth";
import { Avatar, Button, Logo } from "@/shared/components";
import clsx from "clsx";
import { SvgSignOut } from "@/assets/icons";

interface Props {
  className?: string;
}

export async function Header({ className }: Props) {
  const user = await getAuthUser();

  return (
    <header
      className={clsx(
        "flex h-[80px] w-full items-center bg-[#17191C] p-4 shadow-lg sm:px-4 md:px-8 lg:px-16",
        className,
      )}
    >
      <div className="w-40"></div>
      <Logo className="flex-shrink-[0.5] flex-grow" />

      <div className="flex w-40 justify-end gap-4">
        <Avatar size={40} username={user.id} />

        <form
          action={async () => {
            "use server";
            await signOut({ redirect: true, redirectTo: "/" });
          }}
        >
          <Button variant="outlined">
            <span className="hidden sm:block">Sign Out</span>
            <span className="sm:hidden">
              <SvgSignOut />
            </span>
          </Button>
        </form>
      </div>
    </header>
  );
}
