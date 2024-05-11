import { GeistSans } from "geist/font/sans";
import { Toaster } from "@/shared/components";
import { GlobalStoreProvider } from "@/shared/providers";
import "@/styles/globals.scss";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CTF Arena",
  description: "A platform challenging users to show their technical prowess",
};

interface LayoutProps {
  readonly children: React.ReactNode;
}

export default async function RootLayout({ children }: LayoutProps) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body>
        <GlobalStoreProvider>
          {children}
          <div id="portal"></div>
          <Toaster />
        </GlobalStoreProvider>
      </body>
    </html>
  );
}
