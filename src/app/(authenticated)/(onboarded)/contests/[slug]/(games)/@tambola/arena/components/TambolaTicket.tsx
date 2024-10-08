import clsx from "clsx";
import { Ticket, TicketItem } from "@/services/contest/games/tambola";
import { SvgStar } from "@/assets/icons";
import styles from "./tambola-ticket.module.scss";
import { Tooltip } from "@/shared/components";

interface TambolaTicketProps {
  claimedItems: TicketItem[];
  markedItems: TicketItem[];
  toggleItem: (item: TicketItem) => void;
  ticket: Ticket;
  loading?: boolean;
}

const emptyTambolaTicket: Ticket = Array.from({ length: 9 }, () =>
  Array.from({ length: 3 }, () => 0),
);

export function TambolaTicket(props: TambolaTicketProps) {
  const ticket = props.loading ? emptyTambolaTicket : props.ticket;

  return (
    <div className={styles.ticket}>
      <ul className={styles.grid}>
        {ticket.map((row, i) =>
          row.map((item, j) => (
            <li
              key={`cell-${i}-${j}`}
              className={clsx(styles.item, {
                [styles.empty]: item === 0,
                [styles.marked]:
                  props.markedItems.includes(item) ||
                  props.claimedItems.includes(item),
                [styles.claimed]: props.claimedItems.includes(item),
              })}
            >
              {props.claimedItems.includes(item) ? (
                <Tooltip
                  asChild
                  text="You have claimed win for this item and it cannot be unmarked."
                >
                  <button disabled>
                    <span>&nbsp;{item}&nbsp;</span>
                    <SvgStar fill="#FBBB3F" />
                  </button>
                </Tooltip>
              ) : (
                <button
                  disabled={!item}
                  onClick={(e) => {
                    if (e.isTrusted) props.toggleItem(item);
                  }}
                >
                  <span>&nbsp;{item}&nbsp;</span>
                </button>
              )}
            </li>
          )),
        )}
      </ul>
    </div>
  );
}
