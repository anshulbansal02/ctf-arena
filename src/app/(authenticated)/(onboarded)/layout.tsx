import { FloatingNav } from "../components/FloatingNav";
import { Header } from "../components/Header";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Header className="fixed top-0 z-10" />
      <main className="mt-[80px]">{children}</main>
      <FloatingNav />
    </>
  );
}
