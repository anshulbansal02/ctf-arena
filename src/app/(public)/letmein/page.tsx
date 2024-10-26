import { Avatar, Button } from "@/shared/components";

export default function LetMeIn({
  searchParams,
}: {
  searchParams: { token: string; identifier: string };
}) {
  const { token, identifier } = searchParams;

  return (
    <form
      className="grid h-screen w-screen place-items-center px-4 py-16"
      method="GET"
      action="/api/auth/callback/magic-link"
    >
      <div className="flex flex-col items-center">
        <h2 className="text-2xl font-medium">Authenticate as</h2>
        <div className="mt-6 flex flex-col items-center">
          <Avatar username={identifier} size={60} />
          <p className="mt-2 text-lg">{identifier}?</p>
        </div>

        <input name="token" value={token} readOnly hidden></input>
        <input name="email" value={identifier} readOnly hidden></input>
        <Button className="mt-16 w-[180px]">Yes, let me in</Button>
      </div>
    </form>
  );
}
