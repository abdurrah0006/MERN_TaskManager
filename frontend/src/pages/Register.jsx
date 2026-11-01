import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LuMail, LuUser } from "react-icons/lu";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import Alert from "../components/Alert";
import AuthLayout from "../components/AuthLayout";
import { Field, PasswordField } from "../components/Field";

export default function Register() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      signIn(await api.post("/auth/register", form));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Set up your workspace and start tracking tasks."
      footer={<>Already have an account? <Link to="/login">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit} className="stack">
        <Alert>{error}</Alert>
        <Field label="Full name" icon={LuUser}>
          {({ id }) => (
            <input id={id} value={form.name} onChange={set("name")} placeholder="Alex Morgan" autoComplete="name" maxLength={60} required autoFocus />
          )}
        </Field>
        <Field label="Email" icon={LuMail}>
          {({ id }) => (
            <input id={id} type="email" value={form.email} onChange={set("email")} placeholder="you@company.com" autoComplete="email" required />
          )}
        </Field>
        <PasswordField
          hint="Use at least 6 characters."
          value={form.password}
          onChange={set("password")}
          placeholder="Create a password"
          autoComplete="new-password"
          minLength={6}
          required
        />
        <button className="btn btn-primary btn-lg btn-block" disabled={loading}>
          {loading && <span className="spinner" />}
          Create account
        </button>
      </form>
    </AuthLayout>
  );
}
