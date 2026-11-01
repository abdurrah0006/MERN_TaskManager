import { useState } from "react";
import { LuCalendar, LuCheck } from "react-icons/lu";
import { cx, formatDate, isOverdue } from "../utils";
import Avatar from "./Avatar";
import PriorityBadge from "./PriorityBadge";

export default function TaskCard({ task, done, onOpen }) {
  const [dragging, setDragging] = useState(false);
  const overdue = !done && isOverdue(task.dueDate);

  return (
    <div
      className={cx("task-card", done && "is-done", dragging && "is-dragging")}
      role="button"
      tabIndex={0}
      draggable
      onClick={onOpen}
      onKeyDown={(event) => event.key === "Enter" && onOpen()}
      onDragStart={(event) => {
        event.dataTransfer.setData("text/plain", task._id);
        event.dataTransfer.effectAllowed = "move";
        setDragging(true);
      }}
      onDragEnd={() => setDragging(false)}
    >
      <p className="task-title">
        {done && <LuCheck size={14} className="task-check" />}
        {task.title}
      </p>
      {task.description && <p className="task-desc">{task.description}</p>}

      <div className="task-meta">
        <PriorityBadge priority={task.priority} />
        {task.dueDate && (
          <span className={cx("chip", overdue && "chip-overdue")} title={overdue ? "Overdue" : "Due date"}>
            <LuCalendar size={12} />
            {formatDate(task.dueDate)}
          </span>
        )}
        {task.assignedTo && <Avatar name={task.assignedTo.name} size="sm" className="task-assignee" />}
      </div>
    </div>
  );
}
