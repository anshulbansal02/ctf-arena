"use client";
import Link from "next/link";
import styles from "./floating-nav.module.scss";
import { usePathname } from "next/navigation";
import clsx from "clsx";

export function FloatingNav() {
  const navItems = [
    {
      label: "Home",
      to: "/home",
    },
    {
      label: "Team",
      to: "/team",
    },
    {
      label: "Contests",
      to: "/contests",
    },
  ];

  const pathname = usePathname();

  const isActivePath = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <nav className={styles.nav}>
      <ul>
        {navItems.map((item) => (
          <li
            key={item.to}
            className={clsx({ [styles.active]: isActivePath(item.to) })}
          >
            <Link href={item.to} prefetch>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
