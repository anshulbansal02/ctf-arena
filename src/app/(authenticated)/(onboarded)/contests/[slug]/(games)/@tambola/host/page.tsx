import { getAuthUser } from "@/services/auth";
import { redirect } from "next/navigation";

export async function HostPage() {
  const user = await getAuthUser();
  if (!user.roles.includes("host")) redirect("/");

  return (
    <div>
      Show Host Specific Controls and Information
      <span>Marked Numbers</span>
      <span>Current Draw</span>
      <span>Draw Button</span>
      <span>Wins Left</span>
    </div>
  );
}
