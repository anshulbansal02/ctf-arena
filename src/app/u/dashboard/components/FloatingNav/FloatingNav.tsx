import Link from "next/link";
import styles from "./floating-nav.module.scss";

export function FloatingNav() {
  const navItems = [
    {
      id: 1,
      label: "Home",
      to: "dashboard",
    },
    {
      id: 2,
      label: "Team",
      to: "team",
    },
    {
      id: 3,
      label: "LeaderBoard",
      to: "leaderboard",
    },
  ];

  return (
    <nav className={styles.nav}>
      <ul>
        {navItems.map((item) => (
          <li key={item.id}>
            <Link href={item.to}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
