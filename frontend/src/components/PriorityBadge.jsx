import { LuChevronDown, LuChevronsUp, LuEqual } from "react-icons/lu";
import { PRIORITIES, cx } from "../utils";

const ICONS = { high: LuChevronsUp, medium: LuEqual, low: LuChevronDown };

export default function PriorityBadge({ priority = "medium" }) {
  const Icon = ICONS[priority];
  const label = PRIORITIES.find((p) => p.value === priority)?.label;

  return (
    <span className={cx("badge", `badge-${priority}`)}>
      <Icon size={13} />
      {label}
    </span>
  );
}
