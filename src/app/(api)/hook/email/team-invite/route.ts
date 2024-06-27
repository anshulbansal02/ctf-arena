import { db } from "@/services/db";
import { emailService, renderTemplate } from "@/services/email";
import { TB_teamRequest, TB_teams } from "@/services/team";
import { TB_users } from "@/services/user";
import { and, eq } from "drizzle-orm";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    record: { id: number };
  };
  if (!body.record.id) return Response.json("Invalid request", { status: 400 });

  const TB_T = TB_teams,
    TB_TR = TB_teamRequest,
    TB_U = TB_users;

  const [invite] = await db
    .select({
      teamName: TB_T.name,
      status: TB_TR.status,
      metadata: TB_TR.metadata,
      inviter: {
        email: TB_U.email,
        name: TB_U.full_name,
      },
      inviteeEmail: TB_TR.userEmail,
    })
    .from(TB_TR)
    .leftJoin(TB_T, eq(TB_T.id, TB_TR.teamId))
    .leftJoin(TB_U, eq(TB_U.email, TB_TR.userEmail))
    .where(and(eq(TB_TR.id, body.record.id), eq(TB_TR.type, "invite")))
    .limit(1);

  if (!invite) return Response.json("Invite not found", { status: 400 });

  const emailBody = renderTemplate("team-invite", {
    inviteeEmail: invite.inviteeEmail!,
    inviterEmail: invite.inviter?.email!,
    inviteLink: "",
    inviterName: invite.inviter?.name!,
    teamName: invite.teamName!,
  });

  await emailService.send({
    address: {
      from: "onboarding@resend.dev",
      to: invite.inviteeEmail!,
    },
    subject: `Join ${invite.teamName} on CTF Arena`,
    body: emailBody,
  });

  return Response.json("Invite sent", { status: 200 });
}
