import { Link } from "react-router-dom";
import {
  LuBellRing,
  LuCalendarCheck,
  LuColumns3,
  LuFlag,
  LuMessageSquare,
  LuUsers,
} from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import BoardPreview from "../components/BoardPreview";
import Logo from "../components/Logo";

const FEATURES = [
  { icon: LuColumns3, title: "Your own columns", text: "Start with To Do, In Progress and Done, then add, rename or remove columns to fit your workflow." },
  { icon: LuBellRing, title: "Live updates", text: "When a teammate moves a card or adds a task, your board updates instantly. No refreshing." },
  { icon: LuUsers, title: "Shared projects", text: "Invite teammates by email and give every task a clear owner." },
  { icon: LuFlag, title: "Priorities", text: "Mark tasks high, medium or low so the important work stands out." },
  { icon: LuCalendarCheck, title: "Due dates", text: "Overdue tasks are highlighted on the board and on your dashboard." },
  { icon: LuMessageSquare, title: "Task comments", text: "Keep discussion next to the work instead of scattered across chats." },
];

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="container landing-nav-inner">
          <Logo />
          <nav className="landing-nav-actions">
            {user ? (
              <Link to="/dashboard" className="btn btn-primary">Open dashboard</Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-ghost">Sign in</Link>
                <Link to="/register" className="btn btn-primary">Create account</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main>
        <section className="container hero">
          <div className="hero-copy">
            <h1>Plan work on a board your whole team can see.</h1>
            <p>
              Create a project, set up columns that match how you work, and drag tasks from idea to done.
              Everyone on the project sees changes as they happen.
            </p>
            <div className="hero-actions">
              <Link to={user ? "/dashboard" : "/register"} className="btn btn-primary btn-lg">
                {user ? "Open dashboard" : "Create free account"}
              </Link>
              {!user && <Link to="/login" className="btn btn-secondary btn-lg">Sign in</Link>}
            </div>
          </div>
          <div className="hero-visual">
            <BoardPreview />
          </div>
        </section>

        <section className="container section" aria-labelledby="features-title">
          <h2 id="features-title" className="section-title">Everything a small team needs to stay on track</h2>
          <div className="features">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <article key={title} className="feature">
                <span className="feature-icon"><Icon size={20} /></span>
                <h3>{title}</h3>
                <p className="text-muted">{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="container section">
          <div className="cta on-dark">
            <h2>Start your first project in under a minute.</h2>
            <p>Sign up, name a project, and add your first task.</p>
            <Link to={user ? "/dashboard" : "/register"} className="btn btn-inverse btn-lg">
              {user ? "Open dashboard" : "Create free account"}
            </Link>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="container landing-footer-inner">
          <Logo />
          <small className="text-muted">&copy; {new Date().getFullYear()} Tracker</small>
        </div>
      </footer>
    </div>
  );
}
