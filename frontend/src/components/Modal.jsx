import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { LuX } from "react-icons/lu";
import { cx } from "../utils";

// Tracks open modals so Escape only closes the top-most one.
const openModals = [];

export default function Modal({ title, onClose, children, footer, size = "md" }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    const token = Symbol("modal");
    openModals.push(token);

    const onKeyDown = (event) => {
      if (event.key === "Escape" && openModals[openModals.length - 1] === token) {
        closeRef.current();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    const previous = document.activeElement;
    document.body.style.overflow = "hidden";
    if (!dialogRef.current.contains(document.activeElement)) dialogRef.current.focus();

    return () => {
      openModals.splice(openModals.indexOf(token), 1);
      document.removeEventListener("keydown", onKeyDown);
      if (openModals.length === 0) document.body.style.overflow = "";
      previous?.focus?.();
    };
  }, []);

  return createPortal(
    <div
      className="modal-overlay"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        className={cx("modal", `modal-${size}`)}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
      >
        <header className="modal-header">
          <h2>{title}</h2>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose} aria-label="Close">
            <LuX size={18} />
          </button>
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>,
    document.body
  );
}
