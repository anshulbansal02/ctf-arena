import { getContests } from "@/services/contest";

export default async function ContestsPage() {
  const [activeContests, upcomingContests, pastContests] = await Promise.all([
    getContests("active"),
    getContests("upcoming"),
    getContests("ended"),
  ]);

  return (
    <div>
      <section>
        <h2>Ongoing Contests</h2>
        <ul>
          {activeContests.map((contest) => (
            <li key={contest.id}>
              {contest.name}
              {contest.description}
              <button>Join & Go To Arena</button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Upcoming Contests</h2>
        <ul>
          {upcomingContests.map((contest) => (
            <li key={contest.id}>
              {contest.name}
              {contest.description}
              <button>Join</button>
            </li>
          ))}
        </ul>
      </section>
      <section>
        <h2>Past Contests</h2>
        <ul>
          {pastContests.map((contest) => (
            <li key={contest.id}>
              {contest.name}
              {contest.description}
              <button>View Results</button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
