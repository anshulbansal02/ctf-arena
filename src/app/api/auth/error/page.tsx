import Image from "next/image";
import AuthErrorImage from "@/assets/media/auth-error.png";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "CTF Arena — Authentication Error",
  icons: [
    {
      rel: "icon",
      url: "/static/favicon/icon-amber.svg",
    },
  ],
};

export default function ErrorPage({
  searchParams,
}: {
  searchParams: { error: string };
}) {
  return (
    <div className="grid h-dvh place-items-center">
      <div className="max-w-[640px] text-center">
        <Image
          src={AuthErrorImage}
          alt="Lock Error Icon"
          width={140}
          height={140}
          className="mx-auto"
        />

        <h2 className="mt-8 text-2xl font-medium text-orange-200">
          Authentication Error
        </h2>
        <p className="mt-2 text-lg">
          There was an error authenticating you on CTF Arena.
        </p>
        <p className="mt-8 text-balance text-slate-300">
          Please try again using a valid magic link or credentials. If the issue
          persists please get in touch with support with the error code shown
          below.
        </p>
        <p className="mt-6">
          Error Code:&nbsp;&nbsp;
          <span className="rounded-md bg-slate-700 px-3 py-2">
            {searchParams.error}
          </span>
        </p>
      </div>
    </div>
  );
}
