import { useEffect, useRef, useState } from "react";
import { LuEllipsis } from "react-icons/lu";

// items: [{ label, icon: Icon, onClick, disabled }]
export default function DropdownMenu({ items, label = "More options" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event) => !ref.current?.contains(event.target) && setOpen(false);
    const onKeyDown = (event) => event.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div className="menu" ref={ref}>
      <button
        className="btn btn-ghost btn-icon btn-sm"
        onClick={() => setOpen((o) => !o)}
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <LuEllipsis size={18} />
      </button>
      {open && (
        <div className="menu-list" role="menu">
          {items.map(({ label: text, icon: Icon, onClick, disabled }) => (
            <button
              key={text}
              role="menuitem"
              className="menu-item"
              disabled={disabled}
              onClick={() => {
                setOpen(false);
                onClick();
              }}
            >
              <Icon size={15} />
              {text}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
