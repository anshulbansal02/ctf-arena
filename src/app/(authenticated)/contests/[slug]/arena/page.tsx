import { Button, Confetti, Input } from "@/shared/components";

export default function SubmissionPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-[600px] flex-col items-center">
      <div className="">
        <h2>Team Stats</h2>
      </div>

      <h2>Submit A Flag</h2>
      <Input />
      <Confetti render={(launch) => <Button onClick={launch}>Submit</Button>} />
    </div>
  );
}
