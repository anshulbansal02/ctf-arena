import { config } from "@/config";
import { Logo } from "@/shared/components";

export default async function SupportPage() {
  const supportEmailAddress = config.app.sourceEmailAddress.support;

  return (
    <section className="mx-auto flex max-w-[600px] flex-col items-center px-4 py-16">
      <div>
        <Logo />
      </div>
      <h2 className="mt-8 text-xl font-medium">Support</h2>
      <p className="mt-4 text-center font-light text-slate-300">
        If you think the website (ctf-arena.com) is being used for some
        malicious purpose or for any help related issues, please drop us a mail
        at
      </p>
      <a
        href={`mailto:${supportEmailAddress}`}
        className="mt-4 text-lg font-medium"
      >
        {supportEmailAddress}
      </a>
    </section>
  );
}
