import { joinContest } from "@/services/contest/services";
import { Button, Timer } from "@/shared/components";
import { JoinContestButton } from "../components/JoinContestButton";
// import { useAction } from "@/shared/hooks";

export default function ContestPage({ params }: { params: { slug: string } }) {
  // const { execute: enterContest } = useAction(() => joinContest(1));

  const contest = {
    id: 3,
    title: "CTF Challenge 1.0",
    description: `
      <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Molestiae ab debitis ad consequuntur id, voluptatum officiis itaque aliquid accusamus ea, commodi deleniti hic corporis sit dolor reprehenderit voluptatem adipisci fuga quisquam numquam, quis iste dicta totam. Nisi suscipit quaerat totam voluptatibus, quibusdam commodi iure adipisci placeat sapiente tempore, aut voluptatem quia, consectetur quas incidunt labore repellat ut beatae illum odio consequatur inventore minus. Reiciendis consequuntur maiores facere officia minus ab magnam est ut esse, autem sunt ipsa molestiae mollitia perspiciatis amet nam, tempore itaque rem. Sint, modi praesentium quaerat ipsa ducimus, dolorum inventore eaque ab dolorem numquam vitae!</p>
      <ul>
      <li>Hello</li>
      </ul>
      `,
    isStarted: false,
    startsAt: new Date("2024-05-30T20:00:00"),
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center">
      <h2 className="mt-12 text-3xl font-medium">{contest.title}</h2>

      <div className="mt-8 flex w-full items-center justify-between">
        <p>
          Starts In: <Timer till={contest.startsAt} running />
        </p>

        {/* <Button disabled={!contest.isStarted} onClick={() => joinContest(1)}>
          Enter Contest
        </Button> */}

        <JoinContestButton contestId={contest.id} />
      </div>
      <div
        dangerouslySetInnerHTML={{ __html: contest.description }}
        className="prose prose-invert mt-8"
      ></div>
    </div>
  );
}
