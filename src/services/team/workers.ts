import { generalQueue } from "../queue";
import { batchSendInvitations } from "./services";

export function setupTeamQueues() {
  generalQueue.process("batch-send-invitations", () => {
    console.info("[Job] Batch sending invitations");
    batchSendInvitations();
  });

  generalQueue.add("batch-send-invitations", null, {
    jobId: `team_batch_send_invitations`,
    repeat: { cron: "* * * * *" },
  });
}