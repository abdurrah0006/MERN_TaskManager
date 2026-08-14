import { Link } from "react-router-dom";

function Home() {
  return (
    <main className="page page-hero">
      <div className="hero-panel">
        <div>
          <span className="eyebrow">Project Management</span>
          <h1>Manage projects like a pro with a modern board.</h1>
          <p>
            Plan work, track progress, and collaborate in a clean visual workflow interface built for fast teamwork.
          </p>
          <div className="home-actions">
            <Link to="/login">
              <button className="primary-button">Get Started</button>
            </Link>
            <Link to="/register">
              <button className="secondary-button">Create Account</button>
            </Link>
          </div>
        </div>
        <div className="hero-card">
          <div className="hero-card-header">
            <span>Project Board Preview</span>
            <div className="hero-pill">Active Canvas</div>
          </div>
          <div className="hero-card-body">
            <div className="task-preview">Design visual system tokens</div>
            <div className="task-preview">Connect WebSocket engine</div>
            <div className="task-preview">Ship responsive prototype</div>
          </div>
        </div>
      </div>

      <section className="feature-grid">
        <div className="feature-card">
          <h3>Smart Boards</h3>
          <p>Organize tasks into structured status tracks and move work forward smoothly.</p>
        </div>
        <div className="feature-card">
          <h3>Contextual Sync</h3>
          <p>Real-time updates keep cross-functional team pipelines instantly updated.</p>
        </div>
        <div className="feature-card">
          <h3>Zero Configuration</h3>
          <p>Authenticate workspace contexts seamlessly to start planning instantly.</p>
        </div>
      </section>
    </main>
  );
}

export default Home;