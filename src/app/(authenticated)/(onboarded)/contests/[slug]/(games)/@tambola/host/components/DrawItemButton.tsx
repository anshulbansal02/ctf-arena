import { SvgDrawItem } from "@/assets/icons";
import { drawItem, TicketItem } from "@/services/contest/games/tambola";
import { Button } from "@/shared/components";
import { useAction } from "@/shared/hooks";

export function DrawItemButton(props: {
  contestId: number;
  onDraw: (item: TicketItem) => void;
}) {
  const action = useAction(async () => {
    const item = await drawItem(props.contestId);
    if (typeof item === "object") return item;
    props.onDraw(item);
  });

  return (
    <Button loading={action.loading} onClick={action.execute}>
      <SvgDrawItem /> Draw Item
    </Button>
  );
}
