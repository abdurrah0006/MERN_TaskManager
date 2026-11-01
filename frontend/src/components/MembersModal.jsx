import { useState } from "react";
import { LuTrash2, LuUserPlus } from "react-icons/lu";
import { api } from "../api";
import { useConfirm } from "../context/ConfirmContext";
import Alert from "./Alert";
import Avatar from "./Avatar";
import { Field } from "./Field";
import Modal from "./Modal";

export default function MembersModal({ project, user, onChange, onLeft, onClose }) {
  const confirm = useConfirm();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isOwner = project.owner === user._id;

  const invite = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      onChange(await api.post(`/projects/${project._id}/members`, { email }));
      setEmail("");
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  };

  const remove = async (member) => {
    const leaving = member._id === user._id;
    const ok = await confirm({
      title: leaving ? "Leave this project?" : `Remove ${member.name}?`,
      message: leaving
        ? "You will lose access to this board and its tasks."
        : "They will lose access to this board. Their tasks become unassigned.",
      confirmLabel: leaving ? "Leave project" : "Remove member",
    });
    if (!ok) return;
    try {
      const updated = await api.delete(`/projects/${project._id}/members/${member._id}`);
      if (leaving) onLeft();
      else onChange(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal size="md" title={`Members (${project.members.length})`} onClose={onClose}>
      <div className="stack">
        <Alert onDismiss={() => setError("")}>{error}</Alert>

        {isOwner && (
          <form onSubmit={invite} className="invite-form">
            <Field label="Invite by email" icon={LuUserPlus} hint="They need an existing account.">
              {({ id }) => (
                <input id={id} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@company.com" required />
              )}
            </Field>
            <button className="btn btn-primary" disabled={busy || !email.trim()}>
              Invite
            </button>
          </form>
        )}

        <ul className="member-list">
          {project.members.map((member) => {
            const memberIsOwner = member._id === project.owner;
            const isSelf = member._id === user._id;
            const canRemove = !memberIsOwner && (isOwner || isSelf);
            return (
              <li key={member._id} className="member">
                <Avatar name={member.name} />
                <div className="member-info">
                  <strong>
                    {member.name}
                    {isSelf && <span className="text-muted"> (you)</span>}
                  </strong>
                  <small className="text-muted">{member.email}</small>
                </div>
                {memberIsOwner && <span className="badge badge-medium">Owner</span>}
                {canRemove && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => remove(member)}
                    aria-label={isSelf ? "Leave project" : `Remove ${member.name}`}
                  >
                    <LuTrash2 size={15} />
                    {isSelf ? "Leave" : "Remove"}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Modal>
  );
}
