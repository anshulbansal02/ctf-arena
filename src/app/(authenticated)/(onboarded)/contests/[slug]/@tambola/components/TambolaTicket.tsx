import clsx from "clsx";
import { Ticket, TicketItem } from "@/services/contest/games/tambola";
import { SvgStar } from "@/assets/icons";
import styles from "./tambola-ticket.module.scss";

interface TambolaTicketProps {
  lockedItems: TicketItem[];
  markedItems: TicketItem[];
  toggleItem: (item: TicketItem) => void;
  ticket: Ticket;
}

export function TambolaTicket(props: TambolaTicketProps) {
  return (
    <div className={styles.ticket}>
      <ul className={styles.grid}>
        {props.ticket.map((row, i) =>
          row.map((item, j) => (
            <li
              key={`cell-${i}-${j}`}
              className={clsx(styles.item, {
                [styles.empty]: item === 0,
                [styles.marked]: props.markedItems.includes(item),
                [styles.locked]: props.lockedItems.includes(item),
              })}
            >
              <button
                disabled={!item || props.lockedItems.includes(item)}
                onClick={() => props.toggleItem(item)}
              >
                <span>{item}</span>
                {props.lockedItems.includes(item) ? <SvgStar /> : null}
              </button>
            </li>
          )),
        )}
      </ul>
    </div>
  );
}
