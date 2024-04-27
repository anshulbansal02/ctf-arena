import { Toaster } from "@/shared/components";
import { GlobalStoreProvider } from "@/shared/providers";
import "@/styles/globals.scss";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "CTF Arena",
  description: "",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
