import { LuBellRing, LuColumns3, LuUsers } from "react-icons/lu";
import Logo from "./Logo";
import BoardPreview from "./BoardPreview";

const POINTS = [
  { icon: LuColumns3, text: "Columns that match how your team works" },
  { icon: LuUsers, text: "Assign tasks and see who owns what" },
  { icon: LuBellRing, text: "Live updates the moment something changes" },
];

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth">
      <aside className="auth-aside on-dark">
        <Logo />
        <div className="auth-aside-body">
          <h2>Every task, one clear board.</h2>
          <ul className="auth-points">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text}>
                <span className="auth-point-icon">
                  <Icon size={16} />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>
        <BoardPreview variant="dark" />
      </aside>

      <main className="auth-main">
        <div className="auth-card">
          <Logo className="auth-mobile-logo" />
          <h1>{title}</h1>
          <p className="text-muted auth-subtitle">{subtitle}</p>
          {children}
          <p className="auth-footer">{footer}</p>
        </div>
      </main>
    </div>
  );
}
