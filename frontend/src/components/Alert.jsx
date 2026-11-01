import { LuCircleAlert, LuCircleCheck, LuX } from "react-icons/lu";
import { cx } from "../utils";

export default function Alert({ type = "error", children, onDismiss }) {
  if (!children) return null;
  const Icon = type === "success" ? LuCircleCheck : LuCircleAlert;

  return (
    <div className={cx("alert", `alert-${type}`)} role={type === "error" ? "alert" : "status"}>
      <Icon size={18} className="alert-icon" />
      <span className="alert-text">{children}</span>
      {onDismiss && (
        <button className="alert-close" onClick={onDismiss} aria-label="Dismiss">
          <LuX size={16} />
        </button>
      )}
    </div>
  );
}
