import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { request } from "../api";

function Dashboard() {
  const [projects, setProjects] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  useEffect(() => { loadProjects(); }, []);

  const loadProjects = async () => {
    try {
      const data = await request("/projects");
      setProjects(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCreateProject = async (event) => {
    event.preventDefault();
    if (!projectName.trim()) return;
    try {
      await request("/projects", {
        method: "POST",
        body: JSON.stringify({ name: projectName }),
      });
      setProjectName("");
      loadProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  const openProject = (id) => {
    localStorage.setItem("projectId", id);
    navigate("/project");
  };

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <main className="page page-dashboard">
      <div className="dashboard-panel">
        <div className="dashboard-header">
          <div>
            <span className="eyebrow">Workspace Hub</span>
            <h2>Welcome{user && user.name ? `, ${user.name}` : ""} 👋</h2>
            <p>Access your task boards and manage your active project directory.</p>
          </div>
          <button className="secondary-button" onClick={logout}>Disconnect Session</button>
        </div>

        <form onSubmit={handleCreateProject} className="project-form">
          <input
            value={projectName}
            onChange={(event) => setProjectName(event.target.value)}
            placeholder="Assign project title..."
            aria-label="Create new project"
          />
          <button type="submit" className="primary-button">Initialize Board</button>
        </form>

        {error && <div className="error">{error}</div>}

        <div className="projects-grid">
          {projects.length === 0 ? (
            <div className="empty-state">
              <h3>No active boards discovered</h3>
              <p>Initialize your first workspace context above to begin planning.</p>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project._id} className="project-card">
                <div>
                  <h3>{project.name}</h3>
                  <p>CTX_ID: {project._id}</p>
                </div>
                <button onClick={() => openProject(project._id)} className="secondary-button">Open Board</button>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}

export default Dashboard;