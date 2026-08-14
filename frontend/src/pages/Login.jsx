import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../api";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login failed");
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
        <aside className="auth-side">
          <h2>Accelerate your production cycles.</h2>
          <p>Sign in to access your boards, monitor active issues, and map out sprint timelines.</p>
          <ul className="auth-features">
            <li>Visualize operational structures</li>
            <li>Low-latency user syncronisation</li>
            <li>Adaptive board states</li>
          </ul>
        </aside>

        <div className="form-panel">
          <div className="form-intro">
            <span className="eyebrow">Authentication Portal</span>
            <h2>Sign in to Workspace</h2>
            <p>Provide your system credentials below.</p>
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
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
            <button type="submit" className="primary-button">Continue to Dashboard</button>
            {error && <div className="error">{error}</div>}
          </form>
          <p className="form-footer">
            New user? <Link to="/register">Register New Account</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

export default Login;