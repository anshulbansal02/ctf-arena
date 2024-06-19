import { FloatingNav } from "./components/FloatingNav";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <FloatingNav />
    </>
  );
}
