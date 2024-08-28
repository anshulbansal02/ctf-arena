export function ProgressBar(props: { total: number; value: number }) {
  return (
    <div className="h-2 w-full rounded-full" style={{ background: "#1e293b" }}>
      <div
        className="h-2 rounded-full"
        style={{
          width: (props.value / props.total) * 100 + "%",
          background: "#20b0b5",
        }}
      ></div>
    </div>
  );
}
