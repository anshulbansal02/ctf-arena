import { FloatingNav } from "./components";

export default async function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <FloatingNav />
      {children}
    </>
  );
}
