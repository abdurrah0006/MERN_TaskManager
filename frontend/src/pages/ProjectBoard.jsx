import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../api";
import { initSocket } from "../socket";

const defaultColumns = [
  { id: "todo", title: "To Do", status: "To Do", description: "Pending queue targets." },
  { id: "progress", title: "In Progress", status: "In Progress", description: "Currently being tracked." },
  { id: "done", title: "Done", status: "Done", description: "Verified production releases." },
];

function ProjectBoard() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [columns, setColumns] = useState(defaultColumns);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDescription, setTaskDescription] = useState("");
  const [selectedStatus, setSelectedStatus] = useState(defaultColumns[0].status);
  const [newColumnName, setNewColumnName] = useState("");
  const [newColumnDesc, setNewColumnDesc] = useState("");
  const [error, setError] = useState("");
  const projectId = localStorage.getItem("projectId");
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const storageKey = `boardColumns_${projectId}`;

  useEffect(() => {
    if (!projectId) { navigate("/dashboard"); return; }
    loadColumns();
    loadTasks();
    
    const socket = initSocket(user?._id);
    socket.emit("joinProject", projectId);
    const reloadTasks = () => loadTasks();

    socket.on("taskCreated", reloadTasks);
    socket.on("taskUpdated", reloadTasks);
    socket.on("taskDeleted", reloadTasks);
    socket.on("commentAdded", reloadTasks);

    return () => {
      socket.off("taskCreated", reloadTasks);
      socket.off("taskUpdated", reloadTasks);
      socket.off("taskDeleted", reloadTasks);
      socket.off("commentAdded", reloadTasks);
    };
  }, [navigate, projectId]);

  const loadColumns = () => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setColumns(parsed);
        setSelectedStatus(parsed[0]?.status || defaultColumns[0].status);
        return;
      } catch {}
    }
    setColumns(defaultColumns);
    setSelectedStatus(defaultColumns[0].status);
  };

  const persistColumns = (updatedColumns) => {
    setColumns(updatedColumns);
    localStorage.setItem(storageKey, JSON.stringify(updatedColumns));
  };

  const ensureTaskStatusesInColumns = (taskList) => {
    const extraStatuses = Array.from(
      new Set(
        taskList
          .map((task) => task.status || "To Do")
          .filter((status) => !columns.some((column) => column.status === status))
      )
    );
    if (extraStatuses.length > 0) {
      const newColumns = [
        ...columns,
        ...extraStatuses.map((status) => ({
          id: `col-${status.replace(/\s+/g, "-").toLowerCase()}`,
          title: status,
          status,
          description: "Custom stage trace.",
        })),
      ];
      persistColumns(newColumns);
    }
    return taskList.map((task) => ({ ...task, status: task.status || "To Do" }));
  };

  const loadTasks = async () => {
    if (!projectId) return;
    try {
      const data = await request(`/tasks/${projectId}`);
      setTasks(ensureTaskStatusesInColumns(data));
    } catch (err) { setError(err.message); }
  };

  const createTask = async (event) => {
    event.preventDefault();
    if (!taskTitle.trim()) return;
    try {
      await request("/tasks", {
        method: "POST",
        body: JSON.stringify({ title: taskTitle, description: taskDescription, projectId, status: selectedStatus }),
      });
      setTaskTitle(""); setTaskDescription(""); loadTasks();
    } catch (err) { setError(err.message); }
  };

  const createColumn = (event) => {
    event.preventDefault();
    if (!newColumnName.trim()) return;
    const newColumn = {
      id: `col-${Date.now()}`,
      title: newColumnName,
      status: newColumnName,
      description: newColumnDesc || "Custom lifecycle.",
    };
    const updatedColumns = [...columns, newColumn];
    persistColumns(updatedColumns);
    setNewColumnName(""); setNewColumnDesc(""); setSelectedStatus(newColumn.status);
  };

  const updateTaskStatus = async (taskId, status) => {
    try {
      await request(`/tasks/${taskId}`, { method: "PUT", body: JSON.stringify({ status }) });
      loadTasks();
    } catch (err) { setError(err.message); }
  };

  return (
    <main className="page page-board">
      <div className="board-header">
        <div>
          <span className="eyebrow">Kanban Canvas</span>
          <h2>Sprint Architecture</h2>
          <p>Drag task cards across tracking blocks to update work stage parameters live.</p>
        </div>
        <button className="secondary-button" onClick={() => navigate("/dashboard")}>Exit Board</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="controls-row">
        <section className="new-column-panel">
          <h4 className="controls-title">Append Stage</h4>
          <form onSubmit={createColumn} className="column-form">
            <input value={newColumnName} onChange={(e) => setNewColumnName(e.target.value)} placeholder="Stage key..." />
            <input value={newColumnDesc} onChange={(e) => setNewColumnDesc(e.target.value)} placeholder="Description metadata..." />
            <button type="submit" className="secondary-button">Add Column</button>
          </form>
        </section>

        <section className="task-create-panel">
          <h4 className="controls-title">Insert Work-Item</h4>
          <form onSubmit={createTask} className="task-form">
            <input value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Issue title..." />
            <input value={taskDescription} onChange={(e) => setTaskDescription(e.target.value)} placeholder="Details..." />
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
              {columns.map((c) => (<option key={c.id} value={c.status}>{c.title}</option>))}
            </select>
            <button type="submit" className="primary-button">Commit Task</button>
          </form>
        </section>
      </div>

      <div className="board">
        {columns.map((column) => (
          <section
            key={column.id}
            className="column"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const id = e.dataTransfer.getData("text/plain");
              if (id) updateTaskStatus(id, column.status);
            }}
          >
            <div className="column-title">
              <div>
                <h3>{column.title}</h3>
                <p className="column-description">{column.description}</p>
              </div>
              <span>{tasks.filter((t) => t.status === column.status).length}</span>
            </div>
            
            <div className="column-list">
              {tasks.filter((t) => t.status === column.status).map((task) => (
                <div
                  key={task._id}
                  className="task-card"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData("text/plain", task._id);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                >
                  <div className="task-card-title">{task.title}</div>
                  {task.description && <p className="task-card-desc">{task.description}</p>}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}

export default ProjectBoard;