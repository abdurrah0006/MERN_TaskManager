import { cx, initials } from "../utils";

export default function Avatar({ name, size = "md", className }) {
  return (
    <span className={cx("avatar", `avatar-${size}`, className)} title={name} aria-label={name}>
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ people, max = 4, size = "sm" }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;

  return (
    <span className="avatar-stack">
      {shown.map((person) => (
        <Avatar key={person._id} name={person.name} size={size} />
      ))}
      {extra > 0 && <span className={cx("avatar", `avatar-${size}`, "avatar-more")}>+{extra}</span>}
    </span>
  );
}
