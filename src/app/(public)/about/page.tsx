import { config } from "@/config";
import { Logo } from "@/shared/components";

export default async function AboutPage() {
  return (
    <section className="mx-auto flex max-w-[600px] flex-col items-center px-4 py-16">
      <div>
        <Logo />
      </div>
      <p className="mt-8 text-center font-light text-slate-300">
        App Version: <span>{config.appVersion ?? "Unavailable"}</span>
      </p>
    </section>
  );
}
