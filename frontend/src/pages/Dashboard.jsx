import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuCircleCheck, LuClockAlert, LuFolderKanban, LuFolderPlus, LuListTodo, LuPlus } from "react-icons/lu";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { formatDate, isDone, isOverdue, timeAgo } from "../utils";
import Alert from "../components/Alert";
import { AvatarStack } from "../components/Avatar";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";
import PriorityBadge from "../components/PriorityBadge";
import ProjectFormModal from "../components/ProjectFormModal";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    Promise.all([api.get("/projects"), api.get("/tasks/mine")])
      .then(([projectList, taskList]) => {
        setProjects(projectList);
        setMyTasks(taskList);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const { open, completed, overdue } = useMemo(() => {
    const isCompleted = (t) => isDone(t.project, t.status);
    const openTasks = myTasks.filter((t) => !isCompleted(t));
    return {
      open: openTasks,
      completed: myTasks.length - openTasks.length,
      overdue: openTasks.filter((t) => isOverdue(t.dueDate)).length,
    };
  }, [myTasks]);

  const stats = [
    { icon: LuFolderKanban, label: "Projects", value: projects.length },
    { icon: LuListTodo, label: "Assigned to me", value: open.length },
    { icon: LuClockAlert, label: "Overdue", value: overdue },
    { icon: LuCircleCheck, label: "Completed", value: completed },
  ];

  const newProjectButton = (
    <button className="btn btn-primary" onClick={() => setCreating(true)}>
      <LuPlus size={16} />
      New project
    </button>
  );

  return (
    <div className="page">
      <PageHeader
        title="Dashboard"
        description={`Welcome back, ${user.name.split(" ")[0]}. Here is where your work stands.`}
        actions={newProjectButton}
      />

      <Alert onDismiss={() => setError("")}>{error}</Alert>

      <section className="stats" aria-label="Summary">
        {stats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="stat">
            <Icon size={18} className="stat-icon" />
            <span className="stat-value">{loading ? "-" : value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </section>

      <div className="dash-grid">
        <section aria-labelledby="projects-title">
          <h2 id="projects-title" className="section-heading">Projects</h2>

          {loading ? (
            <div className="page-loader-inline"><span className="spinner spinner-lg" /></div>
          ) : projects.length === 0 ? (
            <EmptyState
              icon={LuFolderPlus}
              title="Create your first project"
              description="A project holds a board of tasks. Add one to start planning."
              action={newProjectButton}
            />
          ) : (
            <div className="project-grid">
              {projects.map((project) => {
                const percent = project.taskCount ? Math.round((project.doneCount / project.taskCount) * 100) : 0;
                return (
                  <Link key={project._id} to={`/projects/${project._id}`} className="project-card">
                    <div className="project-card-top">
                      <h3>{project.name}</h3>
                      {project.owner === user._id && <span className="badge badge-medium">Owner</span>}
                    </div>
                    <p className="project-desc text-muted">{project.description || "No description"}</p>

                    <div className="progress-block">
                      <div className="progress" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Tasks completed">
                        <span style={{ width: `${percent}%` }} />
                      </div>
                      <small className="text-muted">
                        {project.taskCount === 0 ? "No tasks yet" : `${project.doneCount} of ${project.taskCount} tasks done`}
                      </small>
                    </div>

                    <div className="project-card-foot">
                      <AvatarStack people={project.members} />
                      <small className="text-muted">Updated {timeAgo(project.updatedAt)}</small>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        <aside aria-labelledby="assigned-title">
          <h2 id="assigned-title" className="section-heading">Assigned to me</h2>
          {loading ? null : open.length === 0 ? (
            <div className="panel panel-pad">
              <p className="text-muted">Nothing assigned to you right now.</p>
            </div>
          ) : (
            <ul className="panel task-list">
              {open.slice(0, 8).map((task) => (
                <li key={task._id}>
                  <button className="task-row" onClick={() => navigate(`/projects/${task.project._id}`)}>
                    <span className="task-row-main">
                      <strong>{task.title}</strong>
                      <small className="text-muted">{task.project.name}</small>
                    </span>
                    <span className="task-row-side">
                      <PriorityBadge priority={task.priority} />
                      {task.dueDate && (
                        <small className={isOverdue(task.dueDate) ? "overdue-text" : "text-muted"}>
                          {formatDate(task.dueDate)}
                        </small>
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      {creating && (
        <ProjectFormModal
          onClose={() => setCreating(false)}
          onSaved={(project) => navigate(`/projects/${project._id}`)}
        />
      )}
    </div>
  );
}
