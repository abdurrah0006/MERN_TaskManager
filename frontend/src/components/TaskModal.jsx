import { useEffect, useState } from "react";
import { LuSend, LuTrash2 } from "react-icons/lu";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import { PRIORITIES, timeAgo, toDateInput } from "../utils";
import Alert from "./Alert";
import Avatar from "./Avatar";
import { Field } from "./Field";
import Modal from "./Modal";

// Create a task (task = null) or edit an existing one, with its comment thread.
export default function TaskModal({ project, task, defaultStatus, onClose, onUpsert, onRemove }) {
  const { user, socket } = useAuth();
  const confirm = useConfirm();
  const isNew = !task;

  const [initial] = useState(() => ({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || defaultStatus || project.columns[0],
    priority: task?.priority || "medium",
    dueDate: toDateInput(task?.dueDate),
    assignedTo: task?.assignedTo?._id || "",
  }));
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentError, setCommentError] = useState("");

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));
  const dirty = JSON.stringify(form) !== JSON.stringify(initial);

  // Load comments and keep them live.
  useEffect(() => {
    if (isNew) return;
    api.get(`/comments/${task._id}`).then(setComments).catch((err) => setCommentError(err.message));

    if (!socket) return;
    const onAdded = (comment) =>
      comment.task === task._id &&
      setComments((list) => (list.some((c) => c._id === comment._id) ? list : [...list, comment]));
    const onDeleted = ({ _id }) => setComments((list) => list.filter((c) => c._id !== _id));
    socket.on("commentAdded", onAdded);
    socket.on("commentDeleted", onDeleted);
    return () => {
      socket.off("commentAdded", onAdded);
      socket.off("commentDeleted", onDeleted);
    };
  }, [isNew, task?._id, socket]);

  const handleSave = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    const body = { ...form, assignedTo: form.assignedTo || null, dueDate: form.dueDate || null };
    try {
      const saved = isNew
        ? await api.post("/tasks", { ...body, projectId: project._id })
        : await api.put(`/tasks/${task._id}`, body);
      onUpsert(saved);
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: "Delete this task?",
      message: `"${task.title}" and its comments will be permanently deleted.`,
      confirmLabel: "Delete task",
    });
    if (!ok) return;
    try {
      await api.delete(`/tasks/${task._id}`);
      onRemove(task._id);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleComment = async (event) => {
    event.preventDefault();
    if (!commentText.trim()) return;
    setCommentError("");
    try {
      const comment = await api.post("/comments", { taskId: task._id, text: commentText });
      setComments((list) => (list.some((c) => c._id === comment._id) ? list : [...list, comment]));
      setCommentText("");
    } catch (err) {
      setCommentError(err.message);
    }
  };

  const deleteComment = async (id) => {
    try {
      await api.delete(`/comments/${id}`);
      setComments((list) => list.filter((c) => c._id !== id));
    } catch (err) {
      setCommentError(err.message);
    }
  };

  return (
    <Modal
      size="lg"
      title={isNew ? "New task" : "Task details"}
      onClose={onClose}
      footer={
        <>
          {!isNew && (
            <button type="button" className="btn btn-secondary footer-start" onClick={handleDelete}>
              <LuTrash2 size={16} />
              Delete
            </button>
          )}
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            form="task-form"
            className="btn btn-primary"
            disabled={saving || !form.title.trim() || (!isNew && !dirty)}
          >
            {isNew ? "Create task" : "Save changes"}
          </button>
        </>
      }
    >
      <form id="task-form" onSubmit={handleSave} className="stack">
        <Alert>{error}</Alert>

        <Field label="Title">
          {({ id }) => (
            <input id={id} value={form.title} onChange={set("title")} maxLength={140} placeholder="What needs to be done?" autoFocus={isNew} />
          )}
        </Field>

        <Field label="Description">
          {({ id }) => (
            <textarea id={id} rows={4} value={form.description} onChange={set("description")} maxLength={2000} placeholder="Add more detail" />
          )}
        </Field>

        <div className="form-grid">
          <Field label="Status">
            {({ id }) => (
              <select id={id} value={form.status} onChange={set("status")}>
                {project.columns.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Priority">
            {({ id }) => (
              <select id={id} value={form.priority} onChange={set("priority")}>
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Assignee">
            {({ id }) => (
              <select id={id} value={form.assignedTo} onChange={set("assignedTo")}>
                <option value="">Unassigned</option>
                {project.members.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field label="Due date">
            {({ id }) => <input id={id} type="date" value={form.dueDate} onChange={set("dueDate")} />}
          </Field>
        </div>
      </form>

      {!isNew && (
        <section className="comments" aria-label="Comments">
          <h3>Comments{comments.length > 0 && <span className="count">{comments.length}</span>}</h3>
          <Alert onDismiss={() => setCommentError("")}>{commentError}</Alert>

          {comments.length === 0 ? (
            <p className="text-muted">No comments yet. Start the conversation below.</p>
          ) : (
            <ul className="comment-list">
              {comments.map((comment) => {
                const canDelete = comment.user._id === user._id || project.owner === user._id;
                return (
                  <li key={comment._id} className="comment">
                    <Avatar name={comment.user.name} size="sm" />
                    <div className="comment-body">
                      <p className="comment-head">
                        <strong>{comment.user.name}</strong>
                        <span className="text-muted">{timeAgo(comment.createdAt)}</span>
                      </p>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                    {canDelete && (
                      <button className="btn btn-ghost btn-icon btn-sm" onClick={() => deleteComment(comment._id)} aria-label="Delete comment">
                        <LuTrash2 size={15} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <form onSubmit={handleComment} className="comment-form">
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a comment"
              aria-label="Write a comment"
              maxLength={1000}
            />
            <button className="btn btn-primary btn-icon" disabled={!commentText.trim()} aria-label="Send comment">
              <LuSend size={16} />
            </button>
          </form>
        </section>
      )}
    </Modal>
  );
}
