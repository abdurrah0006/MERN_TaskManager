import { useEffect, useState } from "react";
import { LuMail, LuUser } from "react-icons/lu";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";
import { formatMonthYear, isDone } from "../utils";
import Alert from "../components/Alert";
import Avatar from "../components/Avatar";
import { Field, PasswordField } from "../components/Field";
import PageHeader from "../components/PageHeader";

function ProfileForm() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, email: user.email });
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));
  const dirty = form.name.trim() !== user.name || form.email.trim() !== user.email;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const data = await api.put("/auth/me", form);
      setUser(data.user);
      setForm({ name: data.user.name, email: data.user.email });
      setStatus({ type: "success", text: "Profile updated." });
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    }
    setSaving(false);
  };

  return (
    <section className="panel panel-pad">
      <h2 className="panel-title">Personal information</h2>
      <form onSubmit={handleSubmit} className="stack">
        {status && <Alert type={status.type}>{status.text}</Alert>}
        <div className="form-grid">
          <Field label="Full name" icon={LuUser}>
            {({ id }) => <input id={id} value={form.name} onChange={set("name")} autoComplete="name" maxLength={60} required />}
          </Field>
          <Field label="Email" icon={LuMail}>
            {({ id }) => <input id={id} type="email" value={form.email} onChange={set("email")} autoComplete="email" required />}
          </Field>
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving || !dirty}>Save changes</button>
        </div>
      </form>
    </section>
  );
}

function PasswordForm() {
  const empty = { currentPassword: "", newPassword: "", confirm: "" };
  const [form, setForm] = useState(empty);
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);

  const set = (key) => (event) => setForm((f) => ({ ...f, [key]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (form.newPassword !== form.confirm) {
      setStatus({ type: "error", text: "The new passwords don't match." });
      return;
    }
    setSaving(true);
    setStatus(null);
    try {
      await api.put("/auth/password", {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      setForm(empty);
      setStatus({ type: "success", text: "Password updated." });
    } catch (err) {
      setStatus({ type: "error", text: err.message });
    }
    setSaving(false);
  };

  return (
    <section className="panel panel-pad">
      <h2 className="panel-title">Change password</h2>
      <form onSubmit={handleSubmit} className="stack">
        {status && <Alert type={status.type}>{status.text}</Alert>}
        <PasswordField label="Current password" value={form.currentPassword} onChange={set("currentPassword")} autoComplete="current-password" required />
        <div className="form-grid">
          <PasswordField label="New password" hint="Use at least 6 characters." value={form.newPassword} onChange={set("newPassword")} autoComplete="new-password" minLength={6} required />
          <PasswordField label="Confirm new password" value={form.confirm} onChange={set("confirm")} autoComplete="new-password" required />
        </div>
        <div className="form-actions">
          <button className="btn btn-primary" disabled={saving}>Update password</button>
        </div>
      </form>
    </section>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    Promise.all([api.get("/projects"), api.get("/tasks/mine")])
      .then(([projects, tasks]) =>
        setStats({
          projects: projects.length,
          open: tasks.filter((t) => !isDone(t.project, t.status)).length,
          done: tasks.filter((t) => isDone(t.project, t.status)).length,
        })
      )
      .catch(() => setStats(null));
  }, []);

  return (
    <div className="page">
      <PageHeader title="Profile" description="Manage your account details and password." />

      <div className="profile-grid">
        <aside className="panel panel-pad profile-card">
          <Avatar name={user.name} size="xl" />
          <h2>{user.name}</h2>
          <p className="text-muted">{user.email}</p>
          {user.createdAt && <small className="text-muted">Member since {formatMonthYear(user.createdAt)}</small>}

          <dl className="profile-stats">
            <div><dt>Projects</dt><dd>{stats?.projects ?? "-"}</dd></div>
            <div><dt>Open tasks</dt><dd>{stats?.open ?? "-"}</dd></div>
            <div><dt>Completed</dt><dd>{stats?.done ?? "-"}</dd></div>
          </dl>
        </aside>

        <div className="stack stack-lg">
          <ProfileForm />
          <PasswordForm />
        </div>
      </div>
    </div>
  );
}
