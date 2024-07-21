export function ProgressBar(props: { total: number; value: number }) {
  return (
    <div className="h-2 w-full rounded-full bg-slate-800">
      <div
        className="h-full rounded-full bg-[#20b0b5]"
        style={{ width: (props.value / props.total) * 100 + "%" }}
      ></div>
    </div>
  );
}
