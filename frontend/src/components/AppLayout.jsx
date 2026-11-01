import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { LuBell, LuLayoutDashboard, LuLogOut, LuMenu, LuUser, LuX } from "react-icons/lu";
import { useAuth } from "../context/AuthContext";
import { NotificationProvider, useNotifications } from "../context/NotificationContext";
import { cx } from "../utils";
import Avatar from "./Avatar";
import Logo from "./Logo";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LuLayoutDashboard, match: ["/dashboard", "/projects"] },
  { to: "/notifications", label: "Notifications", icon: LuBell, match: ["/notifications"], badge: true },
  { to: "/profile", label: "Profile", icon: LuUser, match: ["/profile"] },
];

function Shell() {
  const { user, signOut } = useAuth();
  const { unread } = useNotifications();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  const handleSignOut = () => {
    navigate("/", { replace: true });
    signOut();
  };

  return (
    <div className="app">
      <header className="topbar">
        <button className="btn btn-ghost btn-icon" onClick={() => setOpen(true)} aria-label="Open menu">
          <LuMenu size={20} />
        </button>
        <Logo to="/dashboard" />
      </header>

      {open && <div className="scrim" onClick={() => setOpen(false)} />}

      <aside className={cx("sidebar", open && "is-open")}>
        <div className="sidebar-brand">
          <Logo to="/dashboard" />
          <button className="btn btn-ghost btn-icon btn-sm sidebar-close" onClick={() => setOpen(false)} aria-label="Close menu">
            <LuX size={18} />
          </button>
        </div>

        <nav className="sidebar-nav" aria-label="Main">
          {NAV.map(({ to, label, icon: Icon, match, badge }) => {
            const active = match.some((m) => pathname.startsWith(m));
            return (
              <Link key={to} to={to} className={cx("nav-link", active && "is-active")} aria-current={active ? "page" : undefined}>
                <Icon size={18} />
                <span>{label}</span>
                {badge && unread > 0 && <span className="nav-badge">{unread > 99 ? "99+" : unread}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <Link to="/profile" className="user-chip">
            <Avatar name={user.name} />
            <span className="user-chip-text">
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </span>
          </Link>
          <button className="btn btn-secondary btn-block" onClick={handleSignOut}>
            <LuLogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default function AppLayout() {
  return (
    <NotificationProvider>
      <Shell />
    </NotificationProvider>
  );
}
