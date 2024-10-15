import { Button } from "@/shared/components";

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
        <h1 className="text-lg">Authenticate as {identifier}?</h1>
        <input name="token" value={token} readOnly hidden></input>
        <input name="email" value={identifier} readOnly hidden></input>
        <Button className="mt-8">Yes, let me in</Button>
      </div>
    </form>
  );
}
