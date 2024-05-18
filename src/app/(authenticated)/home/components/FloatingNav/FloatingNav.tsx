import Link from "next/link";
import styles from "./floating-nav.module.scss";

export function FloatingNav() {
  const navItems = [
    {
      label: "Home",
      to: "home",
    },
    {
      label: "Team",
      to: "team",
    },
    {
      label: "Contests",
      to: "contests",
    },
  ];

  return (
    <nav className={styles.nav}>
      <ul>
        {navItems.map((item) => (
          <li key={item.to}>
            <Link href={item.to}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
