import styles from "./confetti.module.scss";

interface Props {
  render: (launch: () => void) => React.ReactNode;
}

export function Confetti(props: Props) {
  function launch() {
    // launch confetti
  }

  return (
    <>
      <canvas className={styles.canvas} />
      {props.render(launch)}
    </>
  );
}
