import { Spinner } from "@/shared/components";

export default function LoadingPage() {
  return (
    <div className="grid h-[80vh] w-screen place-items-center">
      <Spinner size={24} color="#fff" />
    </div>
  );
}
