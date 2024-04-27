import { TeamInviteEmail } from "@/templates/emails";
import { render } from "@react-email/render";

const templates = {
  "team-invite": TeamInviteEmail,
} as const;

export function renderTemplate<T extends keyof typeof templates>(
  name: T,
  props: Parameters<(typeof templates)[T]>[0],
) {
  const template = templates[name];

  return render(template(props));
}
