"use client";

interface Props {
  userName: string;
  onNext: (choice: "join" | "create" | "finish") => void;
}

export function TeamingChoiceStep(props: Props) {
  return (
    <div className="mt-24 text-center">
      <h2 className="text-3xl font-normal">
        {props.userName},<br /> What would you like to do next?
      </h2>
      <div className="mx-auto mt-8 flex h-40">
        <button
          className="flex-1 rounded-bl-lg rounded-tl-lg border border-r-[0.5px] text-lg hover:bg-slate-800"
          onClick={() => props.onNext("join")}
        >
          Join A Team
        </button>
        <button
          className="flex-1 rounded-br-lg rounded-tr-lg border border-l-[0.5px] text-lg hover:bg-slate-800"
          onClick={() => props.onNext("create")}
        >
          Create A Team
        </button>
      </div>
      <button
        className="mt-8 h-10 w-full rounded-md bg-gray-800"
        onClick={() => props.onNext("finish")}
      >
        Decide Later
      </button>
    </div>
  );
}
