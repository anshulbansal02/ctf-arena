import "./fireworks.scss";

export function FireworksStage(props: { name: string }) {
  return (
    <div className="fireworks" data-name={props.name}>
      <canvas data-stage="main"></canvas>
      <canvas data-stage="trails"></canvas>
    </div>
  );
}
