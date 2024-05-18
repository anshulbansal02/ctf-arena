import { emailService, renderTemplate } from "@/services/email";
import { createServerClient } from "@/services/supabase/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    record: { id: number };
  };

  if (!body.record.id) return Response.json("1", { status: 400 });

  const supa = createServerClient();

  const invite = (
    await supa
      .from("team_requests")
      .select(
        "...teams(team_name:name), status, metadata, ...users!created_by(inviter_name:full_name, inviter_email:email), user_email",
      )
      .eq("id", body.record.id)
  ).data?.[0];

  if (!invite) return Response.json("2", { status: 400 });

  const emailBody = renderTemplate("team-invite", {
    inviteeEmail: invite.user_email!,
    inviterEmail: invite.inviter_email!,
    inviteLink: "",
    inviterName: invite.inviter_name!,
    teamName: invite.team_name,
  });

  await emailService.send({
    address: {
      from: "onboarding@resend.dev",
      to: invite.user_email!,
    },
    subject: `Join ${invite.team_name} on CTF Arena`,
    body: emailBody,
  });

  return Response.json("Sent", { status: 200 });
}
