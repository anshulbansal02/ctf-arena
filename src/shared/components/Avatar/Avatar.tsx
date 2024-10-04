import clsx from "clsx";
import styles from "./avatar.module.scss";
import Image from "next/image";

interface Props {
  size?: number;
  className?: string;
  username: string | number;
  rounded?: boolean;
  title?: string;
}

export function Avatar({ size = 48, ...props }: Props) {
  return (
    <div className={clsx(styles.avatar, props.className)}>
      <Image
        priority
        title={props.title}
        width={size}
        height={size}
        quality={100}
        style={{ borderRadius: props.rounded ? size : size / 6 }}
        src={`https://api.dicebear.com/9.x/notionists-neutral/svg?backgroundColor=ffffff,d1d4f9,ffdfbf,ffd5dc,c0aede,b6e3f4&backgroundType=gradientLinear&backgroundRotation[]&brows=variant01,variant04,variant05,variant07,variant08,variant09,variant10,variant11,variant12,variant13,variant02,variant06&eyes=variant05&glasses=variant01,variant02,variant03,variant04,variant05,variant06,variant07,variant09,variant10,variant08&lips=variant01,variant02,variant03,variant04,variant05,variant06,variant07,variant08,variant09,variant10,variant11,variant12,variant13,variant14,variant15,variant16,variant17,variant21,variant22,variant23,variant24,variant25,variant26,variant27,variant28,variant29,variant30&seed=${props.username}`}
        alt={props.username?.toString()}
      />
    </div>
  );
}
