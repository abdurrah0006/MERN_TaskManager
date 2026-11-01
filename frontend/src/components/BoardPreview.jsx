import { LuCalendar } from "react-icons/lu";
import { cx } from "../utils";
import Avatar from "./Avatar";
import PriorityBadge from "./PriorityBadge";

const PREVIEW = [
  {
    name: "To Do",
    cards: [
      { title: "Write launch announcement", priority: "medium", due: "Nov 12", who: "Maya Chen" },
      { title: "Audit onboarding emails", priority: "low", who: "Omar Haddad" },
    ],
  },
  {
    name: "In Progress",
    cards: [
      { title: "Redesign pricing page", priority: "high", due: "Nov 8", who: "Priya Nair" },
      { title: "Fix checkout timeout", priority: "high", who: "Maya Chen" },
    ],
  },
  {
    name: "Done",
    cards: [{ title: "Set up analytics", priority: "medium", who: "Omar Haddad", done: true }],
  },
];

// A static, non-interactive picture of the real board, used on marketing screens.
export default function BoardPreview({ variant = "light" }) {
  return (
    <div className={cx("preview", `preview-${variant}`)} aria-hidden="true">
      {PREVIEW.map((column) => (
        <div key={column.name} className="preview-column">
          <div className="preview-column-head">
            <span>{column.name}</span>
            <span className="count">{column.cards.length}</span>
          </div>
          {column.cards.map((card) => (
            <div key={card.title} className={cx("preview-card", card.done && "is-done")}>
              <p>{card.title}</p>
              <div className="preview-card-meta">
                <PriorityBadge priority={card.priority} />
                {card.due && (
                  <span className="chip">
                    <LuCalendar size={12} />
                    {card.due}
                  </span>
                )}
                <Avatar name={card.who} size="sm" className="task-assignee" />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
