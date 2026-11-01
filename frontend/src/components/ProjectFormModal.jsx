import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";
import { api } from "../api";
import Modal from "./Modal";
import Alert from "./Alert";
import { Field } from "./Field";

// Creates a project, or edits one when `project` is passed.
export default function ProjectFormModal({ project, onSaved, onDelete, onClose }) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const body = { name, description };
      const saved = project
        ? await api.put(`/projects/${project._id}`, body)
        : await api.post("/projects", body);
      onSaved(saved);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      title={project ? "Project settings" : "New project"}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button form="project-form" className="btn btn-primary" disabled={saving || !name.trim()}>
            {project ? "Save changes" : "Create project"}
          </button>
        </>
      }
    >
      <form id="project-form" onSubmit={handleSubmit} className="stack">
        <Alert>{error}</Alert>
        <Field label="Name">
          {({ id }) => (
            <input
              id={id}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Website redesign"
              maxLength={80}
              autoFocus
            />
          )}
        </Field>
        <Field label="Description" hint="Optional. A short summary of what this project is about.">
          {({ id }) => (
            <textarea
              id={id}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
            />
          )}
        </Field>
      </form>

      {project && onDelete && (
        <div className="danger-zone">
          <div>
            <h3>Delete project</h3>
            <p className="text-muted">Permanently removes the project, its tasks and comments.</p>
          </div>
          <button type="button" className="btn btn-secondary" onClick={onDelete}>
            <LuTrash2 size={16} />
            Delete
          </button>
        </div>
      )}
    </Modal>
  );
}
