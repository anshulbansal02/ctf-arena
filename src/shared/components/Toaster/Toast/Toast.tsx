import clsx from "clsx";
import { Toast as ToastType } from "./../store";

import styles from "./toast.module.scss";
import { SvgCross } from "@/assets/icons";

interface ToastProps extends ToastType {
  onDismiss: (id: number) => void;
  className?: string;
}

export function Toast({
  id,
  title,
  content,
  icon,
  dismissible = true,
  onDismiss,
  className,
}: ToastProps) {
  return (
    <div className={clsx(styles.container, styles[className ?? ""])}>
      {icon && <div className={styles.icon}>{icon}</div>}
      <div className={styles.body} style={{ paddingLeft: icon ? 0 : "1rem" }}>
        {title && <h4 className={styles.title}>{title}</h4>}
        {content &&
          (typeof content === "string" ? (
            <p className={styles.content}>{content}</p>
          ) : (
            content
          ))}
      </div>

      {dismissible && (
        <button className={styles.dismiss} onClick={() => onDismiss(id)}>
          <SvgCross width={16} height={16} />
        </button>
      )}
    </div>
  );
}
