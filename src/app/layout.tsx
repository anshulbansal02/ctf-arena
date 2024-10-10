import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Toaster } from "@/shared/components";
import "@/styles/globals.scss";
import type { Metadata } from "next";
import { ConnectivityStatus } from "@/shared/providers";

export const metadata: Metadata = {
  title: "CTF Arena",
  description:
    "A platform challenging users to show their ability in exciting games.",
  icons: [
    {
      rel: "icon",
      url: "/static/favicon/icon.svg",
    },
  ],
};

interface LayoutProps {
  readonly children: React.ReactNode;
}

export default async function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body>
        <ConnectivityStatus>
          {children}
          <div id="portal"></div>
          <Toaster />
        </ConnectivityStatus>
      </body>
    </html>
  );
}
