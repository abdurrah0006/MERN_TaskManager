import { useNavigate } from "react-router-dom";
import { LuBell, LuBellOff, LuCheckCheck, LuMessageSquare, LuSquareCheckBig, LuTrash2, LuUsers } from "react-icons/lu";
import { useNotifications } from "../context/NotificationContext";
import { cx, timeAgo } from "../utils";
import EmptyState from "../components/EmptyState";
import PageHeader from "../components/PageHeader";

const ICONS = { task: LuSquareCheckBig, comment: LuMessageSquare, project: LuUsers, system: LuBell };

export default function Notifications() {
  const { items, unread, loading, markRead, markAllRead, clearAll } = useNotifications();
  const navigate = useNavigate();

  const open = (notification) => {
    if (!notification.read) markRead(notification._id);
    if (notification.link) navigate(notification.link);
  };

  return (
    <div className="page page-narrow">
      <PageHeader
        title="Notifications"
        description={unread > 0 ? `You have ${unread} unread` : "You're all caught up."}
        actions={
          items.length > 0 && (
            <>
              <button className="btn btn-secondary" onClick={markAllRead} disabled={unread === 0}>
                <LuCheckCheck size={16} />
                Mark all read
              </button>
              <button className="btn btn-secondary" onClick={clearAll}>
                <LuTrash2 size={16} />
                Clear all
              </button>
            </>
          )
        }
      />

      {loading ? (
        <div className="page-loader-inline"><span className="spinner spinner-lg" /></div>
      ) : items.length === 0 ? (
        <EmptyState
          icon={LuBellOff}
          title="No notifications yet"
          description="You'll be notified when you're assigned a task, added to a project, or someone comments."
        />
      ) : (
        <ul className="panel notification-list">
          {items.map((n) => {
            const Icon = ICONS[n.type] || LuBell;
            return (
              <li key={n._id}>
                <button className={cx("notification", !n.read && "is-unread")} onClick={() => open(n)}>
                  <span className="notification-icon"><Icon size={16} /></span>
                  <span className="notification-text">
                    <span>{n.message}</span>
                    <small className="text-muted">{timeAgo(n.createdAt)}</small>
                  </span>
                  {!n.read && <span className="unread-dot" aria-label="Unread" />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
