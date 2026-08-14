import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../api";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Registration failed");

      localStorage.setItem("token", data.token);
      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <main className="page page-auth">
      <div className="auth-split">
        {/* 20% Structure / Contrast Accent Sidebar */}
        <aside className="auth-side">
          <h2>Create your staging workspace.</h2>
          <p>
            Get started quickly — create an account to plan your work cycles, arrange project tracking, 
            and stream team progress indicators on custom kanban tracks.
          </p>
          <ul className="auth-features">
            <li>Fully customizable workflow pipelines</li>
            <li>Real-time data event sync</li>
            <li>Optimized task execution matrices</li>
          </ul>
        </aside>

        {/* 80% High-Contrast Minimal White Form Area */}
        <div className="form-panel">
          <div className="form-intro">
            <span className="eyebrow" style={{ color: "var(--accent-orange)" }}>
              Workspace Onboarding
            </span>
            <h2>Register Account</h2>
            <p>Fill out the profile attributes below to initialize your credentials.</p>
          </div>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            <button type="submit" className="primary-button">
              Create Profile
            </button>
            {error && <div className="error">{error}</div>}
          </form>

          <p className="form-footer">
            Already have an active account? <Link to="/login">Login here</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Register;