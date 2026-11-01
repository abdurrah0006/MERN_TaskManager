import { useState } from "react";
import Modal from "./Modal";
import Alert from "./Alert";
import { Field } from "./Field";

// A small dialog that asks for one name (used to add or rename a column).
export default function NameModal({ title, label, initial = "", submitLabel, onSubmit, onClose }) {
  const [value, setValue] = useState(initial);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      await onSubmit(value.trim());
      onClose();
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  return (
    <Modal
      size="sm"
      title={title}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button form="name-form" className="btn btn-primary" disabled={saving || !value.trim()}>
            {submitLabel}
          </button>
        </>
      }
    >
      <form id="name-form" onSubmit={handleSubmit} className="stack">
        <Alert>{error}</Alert>
        <Field label={label}>
          {({ id }) => (
            <input id={id} value={value} onChange={(e) => setValue(e.target.value)} maxLength={40} autoFocus />
          )}
        </Field>
      </form>
    </Modal>
  );
}
