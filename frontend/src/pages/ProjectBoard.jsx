import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { LuChevronLeft, LuPlus, LuSearch, LuSettings2, LuUsers } from "react-icons/lu";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { useConfirm } from "../context/ConfirmContext";
import { PRIORITIES, cx, upsertById } from "../utils";
import Alert from "../components/Alert";
import { AvatarStack } from "../components/Avatar";
import Column from "../components/Column";
import MembersModal from "../components/MembersModal";
import NameModal from "../components/NameModal";
import ProjectFormModal from "../components/ProjectFormModal";
import TaskModal from "../components/TaskModal";

export default function ProjectBoard() {
  const { id } = useParams();
  const { user, socket } = useAuth();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({ query: "", priority: "", mine: false });
  const [modal, setModal] = useState(null); // { type, ...data }
  const closeModal = () => setModal(null);

  const loadTasks = useCallback(
    () => api.get(`/tasks/project/${id}`).then(setTasks),
    [id]
  );

  // Initial load.
  useEffect(() => {
    setLoading(true);
    setError("");
    Promise.all([api.get(`/projects/${id}`), loadTasks()])
      .then(([loadedProject]) => setProject(loadedProject))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, loadTasks]);

  // Live updates from teammates.
  useEffect(() => {
    if (!socket) return;
    const join = () => socket.emit("joinProject", id);
    join();

    const onTask = (task) => task.project === id && setTasks((list) => upsertById(list, task));
    const onTaskDeleted = ({ _id }) => setTasks((list) => list.filter((t) => t._id !== _id));
    const onProject = (updated) => {
      if (updated._id !== id) return;
      setProject(updated);
      loadTasks().catch(() => {});
    };
    const onRemoved = ({ projectId }) => projectId === id && navigate("/dashboard", { replace: true });

    socket.on("connect", join);
    socket.on("taskCreated", onTask);
    socket.on("taskUpdated", onTask);
    socket.on("taskDeleted", onTaskDeleted);
    socket.on("projectUpdated", onProject);
    socket.on("projectRemoved", onRemoved);

    return () => {
      socket.emit("leaveProject", id);
      socket.off("connect", join);
      socket.off("taskCreated", onTask);
      socket.off("taskUpdated", onTask);
      socket.off("taskDeleted", onTaskDeleted);
      socket.off("projectUpdated", onProject);
      socket.off("projectRemoved", onRemoved);
    };
  }, [socket, id, navigate, loadTasks]);

  const visibleTasks = useMemo(() => {
    const query = filters.query.trim().toLowerCase();
    return tasks.filter(
      (t) =>
        (!query || `${t.title} ${t.description}`.toLowerCase().includes(query)) &&
        (!filters.priority || t.priority === filters.priority) &&
        (!filters.mine || t.assignedTo?._id === user._id)
    );
  }, [tasks, filters, user._id]);

  const isFiltering = Boolean(filters.query || filters.priority || filters.mine);

  // ---- Task actions ----
  const moveTask = async (taskId, status) => {
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === status) return;

    setTasks((list) => list.map((t) => (t._id === taskId ? { ...t, status } : t)));
    try {
      await api.put(`/tasks/${taskId}`, { status });
    } catch (err) {
      setTasks((list) => list.map((t) => (t._id === taskId ? task : t)));
      setError(err.message);
    }
  };

  const quickAdd = async (status, title) => {
    try {
      const task = await api.post("/tasks", { projectId: id, title, status });
      setTasks((list) => upsertById(list, task));
    } catch (err) {
      setError(err.message);
    }
  };

  // ---- Column actions ----
  const applyProject = (updated) => {
    setProject(updated);
    loadTasks().catch(() => {});
  };

  const deleteColumn = async (name) => {
    const count = tasks.filter((t) => t.status === name).length;
    const ok = await confirm({
      title: `Delete "${name}"?`,
      message: count
        ? `${count} task${count === 1 ? "" : "s"} will move to the first remaining column.`
        : "This column is empty.",
      confirmLabel: "Delete column",
    });
    if (!ok) return;
    try {
      applyProject(await api.delete(`/projects/${id}/columns/${encodeURIComponent(name)}`));
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteProject = async () => {
    const ok = await confirm({
      title: `Delete "${project.name}"?`,
      message: "All tasks and comments in this project will be permanently deleted.",
      confirmLabel: "Delete project",
    });
    if (!ok) return;
    try {
      await api.delete(`/projects/${id}`);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return <div className="page-loader"><span className="spinner spinner-lg" /></div>;
  }

  if (!project) {
    return (
      <div className="page">
        <Link to="/dashboard" className="back-link"><LuChevronLeft size={16} />Dashboard</Link>
        <Alert>{error || "Project not found"}</Alert>
      </div>
    );
  }

  const isOwner = project.owner === user._id;
  const lastColumn = project.columns[project.columns.length - 1];

  return (
    <div className="page page-board">
      <header className="board-header">
        <div className="board-title">
          <Link to="/dashboard" className="back-link"><LuChevronLeft size={16} />Dashboard</Link>
          <h1>{project.name}</h1>
          {project.description && <p className="text-muted">{project.description}</p>}
        </div>
        <div className="board-actions">
          <button className="btn btn-secondary" onClick={() => setModal({ type: "members" })}>
            <AvatarStack people={project.members} max={3} size="xs" />
            <LuUsers size={16} />
            Members
          </button>
          {isOwner && (
            <button className="btn btn-secondary btn-icon" onClick={() => setModal({ type: "settings" })} aria-label="Project settings">
              <LuSettings2 size={18} />
            </button>
          )}
          <button className="btn btn-primary" onClick={() => setModal({ type: "task", task: null })}>
            <LuPlus size={16} />
            New task
          </button>
        </div>
      </header>

      <Alert onDismiss={() => setError("")}>{error}</Alert>

      <div className="board-toolbar">
        <div className="input-wrap has-icon toolbar-search">
          <LuSearch size={16} className="input-icon" />
          <input
            value={filters.query}
            onChange={(e) => setFilters((f) => ({ ...f, query: e.target.value }))}
            placeholder="Search tasks"
            aria-label="Search tasks"
          />
        </div>
        <select
          className="toolbar-select"
          value={filters.priority}
          onChange={(e) => setFilters((f) => ({ ...f, priority: e.target.value }))}
          aria-label="Filter by priority"
        >
          <option value="">All priorities</option>
          {PRIORITIES.map((p) => (
            <option key={p.value} value={p.value}>{p.label} priority</option>
          ))}
        </select>
        <button
          className={cx("btn", filters.mine ? "btn-primary" : "btn-secondary")}
          onClick={() => setFilters((f) => ({ ...f, mine: !f.mine }))}
          aria-pressed={filters.mine}
        >
          Assigned to me
        </button>
        {isFiltering && (
          <button className="btn btn-ghost" onClick={() => setFilters({ query: "", priority: "", mine: false })}>
            Clear filters
          </button>
        )}
      </div>

      <div className="board">
        {project.columns.map((name) => (
          <Column
            key={name}
            name={name}
            done={name === lastColumn}
            tasks={visibleTasks.filter((t) => t.status === name)}
            canDelete={project.columns.length > 1}
            onDropTask={(taskId) => moveTask(taskId, name)}
            onOpenTask={(task) => setModal({ type: "task", task })}
            onQuickAdd={(title) => quickAdd(name, title)}
            onRename={() => setModal({ type: "rename", name })}
            onDelete={() => deleteColumn(name)}
          />
        ))}

        <button className="board-add-column" onClick={() => setModal({ type: "column" })}>
          <LuPlus size={16} />
          Add column
        </button>
      </div>

      {modal?.type === "task" && (
        <TaskModal
          project={project}
          task={modal.task}
          onClose={closeModal}
          onUpsert={(task) => setTasks((list) => upsertById(list, task))}
          onRemove={(taskId) => setTasks((list) => list.filter((t) => t._id !== taskId))}
        />
      )}

      {modal?.type === "column" && (
        <NameModal
          title="Add column"
          label="Column name"
          submitLabel="Add column"
          onClose={closeModal}
          onSubmit={async (name) => applyProject(await api.post(`/projects/${id}/columns`, { name }))}
        />
      )}

      {modal?.type === "rename" && (
        <NameModal
          title="Rename column"
          label="Column name"
          initial={modal.name}
          submitLabel="Save name"
          onClose={closeModal}
          onSubmit={async (name) =>
            applyProject(await api.put(`/projects/${id}/columns/${encodeURIComponent(modal.name)}`, { name }))
          }
        />
      )}

      {modal?.type === "members" && (
        <MembersModal
          project={project}
          user={user}
          onClose={closeModal}
          onChange={applyProject}
          onLeft={() => navigate("/dashboard", { replace: true })}
        />
      )}

      {modal?.type === "settings" && (
        <ProjectFormModal
          project={project}
          onClose={closeModal}
          onSaved={(saved) => {
            setProject(saved);
            closeModal();
          }}
          onDelete={deleteProject}
        />
      )}
    </div>
  );
}
