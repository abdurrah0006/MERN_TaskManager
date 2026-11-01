import { useId, useState } from "react";
import { LuEye, LuEyeOff, LuLock } from "react-icons/lu";
import { cx } from "../utils";

// Label + input wrapper. Pass the <input> (or <select>/<textarea>) as children.
export function Field({ label, icon: Icon, hint, suffix, children, className }) {
  const id = useId();
  const control = children({ id });

  return (
    <div className={cx("field", className)}>
      {label && <label htmlFor={id}>{label}</label>}
      <div className={cx("input-wrap", Icon && "has-icon", suffix && "has-suffix")}>
        {Icon && <Icon size={16} className="input-icon" />}
        {control}
        {suffix}
      </div>
      {hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

export function PasswordField({ label = "Password", hint, ...inputProps }) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      label={label}
      hint={hint}
      icon={LuLock}
      suffix={
        <button
          type="button"
          className="input-suffix"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          {visible ? <LuEyeOff size={16} /> : <LuEye size={16} />}
        </button>
      }
    >
      {({ id }) => <input id={id} type={visible ? "text" : "password"} {...inputProps} />}
    </Field>
  );
}
