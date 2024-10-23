export function FireworksStage(props: { name: string }) {
  return (
    <div className="fireworks-canvas-container">
      <canvas id={`trails-canvas__${props.name}`}></canvas>
      <canvas id={`main-canvas__${props.name}`}></canvas>
    </div>
  );
}
