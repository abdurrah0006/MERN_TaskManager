export const cx = (...classes) => classes.filter(Boolean).join(" ");

export const PRIORITIES = [
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() || "")
    .join("") || "?";

// Due dates are stored as UTC midnight, so format them in UTC to avoid off-by-one days.
const dateFormat = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
const longDateFormat = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

export const formatDate = (iso) => (iso ? dateFormat.format(new Date(iso)) : "");
export const formatMonthYear = (iso) => (iso ? longDateFormat.format(new Date(iso)) : "");
export const toDateInput = (iso) => (iso ? new Date(iso).toISOString().slice(0, 10) : "");

const todayISO = () => new Date().toLocaleDateString("en-CA");
export const isOverdue = (iso) => Boolean(iso) && toDateInput(iso) < todayISO();

export function timeAgo(iso) {
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(iso));
}

// The last column of a board counts as "done".
export const isDone = (project, status) => project.columns[project.columns.length - 1] === status;

export const upsertById = (list, item) =>
  list.some((x) => x._id === item._id)
    ? list.map((x) => (x._id === item._id ? item : x))
    : [item, ...list];
