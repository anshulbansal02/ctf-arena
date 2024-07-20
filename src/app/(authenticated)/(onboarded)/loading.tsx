import { Shim } from "@/shared/components";

export default function LoadingPage() {
  return (
    <div className="mx-auto mt-[120px] flex w-[560px] flex-col items-center">
      <Shim classNames="w-full h-[calc(100vh-160px)]" />
    </div>
  );
}
