import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LuMail } from "react-icons/lu";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
import AuthLayout from "../components/AuthLayout";
import { Field, PasswordField } from "../components/Field";

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      signIn(await api.post("/auth/login", { email, password }));
      navigate(location.state?.from || "/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to open your projects."
      footer={<>New to Tracker? <Link to="/register">Create an account</Link></>}
    >
      <form onSubmit={handleSubmit} className="stack">
        <Alert>{error}</Alert>
        <Field label="Email" icon={LuMail}>
          {({ id }) => (
            <input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" required autoFocus />
          )}
        </Field>
        <PasswordField value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" autoComplete="current-password" required />
        <button className="btn btn-primary btn-lg btn-block" disabled={loading}>
          {loading && <span className="spinner" />}
          Sign in
        </button>
      </form>
    </AuthLayout>
  );
}
