"use client";
import Link from "next/link";
import styles from "./floating-nav.module.scss";
import { usePathname, useSearchParams } from "next/navigation";
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
  const params = useSearchParams();
  const shouldHide = params.get("mode") === "zen";

  const isActivePath = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <nav className={clsx(styles.nav, { hidden: shouldHide })}>
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
