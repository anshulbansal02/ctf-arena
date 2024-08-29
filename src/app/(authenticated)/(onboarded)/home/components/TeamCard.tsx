import { SvgMoveOut, SvgVerticalDots } from "@/assets/icons";
import {
  getTeamDetailsByUserId,
  getTeamDetails,
  TeamDetails,
  leaveTeam,
} from "@/services/team";
import { Avatar, Button } from "@/shared/components";
import * as Popover from "@radix-ui/react-popover";
import { LeaveTeamButton } from "./LeaveTeamButton";

type TeamCardProps = { teamId: number } | { userId: string };

export async function TeamCard(props: TeamCardProps) {
  let team: TeamDetails | undefined;
  if ("teamId" in props) team = await getTeamDetails(props.teamId);
  else team = await getTeamDetailsByUserId(props.userId);

  return team ? (
    <div className="team-card mt-4 min-w-[420px] rounded-lg bg-black px-6 py-4">
      <div className="flex flex-col">
        <div className="flex items-start justify-between">
          <div className="text-left">
            <h4 className="font-medium leading-tight text-slate-400">Name</h4>
            <h3 className="text-lg">{team.name}</h3>
          </div>

          <div>
            <Popover.Root>
              <Popover.Trigger>
                <SvgVerticalDots width={18} height={18} />
              </Popover.Trigger>
              <Popover.Portal>
                <Popover.Content className="mt-2 flex w-40 flex-col gap-2 rounded-lg bg-zinc-800 p-2 shadow-lg">
                  <LeaveTeamButton />
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>
          </div>
        </div>
        <div className="mt-3 text-left">
          <h4 className="font-medium leading-tight text-slate-400">Members</h4>
          <ul className="mt-2 flex flex-wrap gap-4 gap-y-2">
            {team.members.map((member) => (
              <li key={member.id} className="flex items-center gap-2">
                <Avatar username={member.email} size={20} />
                <p>
                  {member.name}{" "}
                  {member.isLeader && (
                    <span className="text-sm font-medium text-slate-400">
                      &#123;Leader&#125;
                    </span>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  ) : (
    <div className="empty-state">
      <p className="mt-4 text-center text-slate-400">
        You are not in a team yet
      </p>
      <div className="mt-8 flex items-center justify-center gap-2">
        <Button variant="outlined" as="link" href="/team/search">
          Join A Team
        </Button>
        <p>Or</p>
        <Button variant="outlined" as="link" href="/team/new">
          Create Your Team
        </Button>
      </div>
    </div>
  );
}
