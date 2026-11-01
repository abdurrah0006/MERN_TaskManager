import { Link } from "react-router-dom";

export function LogoMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="7" fill="currentColor" />
      <rect x="7" y="7" width="5" height="18" rx="1.5" fill="var(--logo-ink, #fff)" />
      <rect x="14" y="7" width="5" height="11" rx="1.5" fill="var(--logo-ink, #fff)" />
      <rect x="21" y="7" width="4" height="14" rx="1.5" fill="var(--logo-ink, #fff)" />
    </svg>
  );
}

export default function Logo({ to = "/", className = "" }) {
  return (
    <Link to={to} className={`logo ${className}`} aria-label="Tracker home">
      <LogoMark />
      <span>Tracker</span>
    </Link>
  );
}
