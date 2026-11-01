import { useState } from "react";
import { LuCircleCheck, LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import { cx } from "../utils";
import DropdownMenu from "./DropdownMenu";
import TaskCard from "./TaskCard";

export default function Column({
  name,
  tasks,
  done,
  canDelete,
  onDropTask,
  onOpenTask,
  onQuickAdd,
  onRename,
  onDelete,
}) {
  const [over, setOver] = useState(false);
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");

  const handleAdd = async (event) => {
    event.preventDefault();
    const value = title.trim();
    if (!value) return;
    setTitle("");
    await onQuickAdd(value);
  };

  return (
    <section
      className={cx("column", over && "is-over")}
      aria-label={name}
      onDragOver={(event) => {
        event.preventDefault();
        setOver(true);
      }}
      onDragLeave={(event) => !event.currentTarget.contains(event.relatedTarget) && setOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setOver(false);
        const id = event.dataTransfer.getData("text/plain");
        if (id) onDropTask(id);
      }}
    >
      <header className="column-header">
        <h2 title={name}>
          {done && <LuCircleCheck size={16} />}
          <span>{name}</span>
        </h2>
        <span className="count">{tasks.length}</span>
        <DropdownMenu
          label={`Options for ${name}`}
          items={[
            { label: "Rename column", icon: LuPencil, onClick: onRename },
            { label: "Delete column", icon: LuTrash2, onClick: onDelete, disabled: !canDelete },
          ]}
        />
      </header>

      <div className="column-body">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} done={done} onOpen={() => onOpenTask(task)} />
        ))}
        {tasks.length === 0 && <p className="column-empty">No tasks here yet</p>}
      </div>

      <footer className="column-footer">
        {adding ? (
          <form onSubmit={handleAdd} className="quick-add">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Escape" && setAdding(false)}
              placeholder="Task title"
              aria-label={`New task in ${name}`}
              maxLength={140}
              autoFocus
            />
            <div className="quick-add-actions">
              <button className="btn btn-primary btn-sm" disabled={!title.trim()}>
                Add task
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setAdding(false)}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button className="btn btn-ghost btn-sm btn-block column-add" onClick={() => setAdding(true)}>
            <LuPlus size={16} />
            Add task
          </button>
        )}
      </footer>
    </section>
  );
}
