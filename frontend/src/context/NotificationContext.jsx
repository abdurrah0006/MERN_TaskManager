import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { useAuth } from "./AuthContext";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { socket } = useAuth();
  const [items, setItems] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/notifications")
      .then((data) => {
        setItems(data.notifications);
        setUnread(data.unread);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    const onNew = (notification) => {
      setItems((prev) => [notification, ...prev]);
      setUnread((count) => count + 1);
    };
    socket.on("notification", onNew);
    return () => socket.off("notification", onNew);
  }, [socket]);

  const markRead = useCallback(async (id) => {
    setItems((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
    setUnread((count) => Math.max(0, count - 1));
    await api.patch(`/notifications/${id}/read`).catch(() => {});
  }, []);

  const markAllRead = useCallback(async () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
    await api.patch("/notifications/read-all").catch(() => {});
  }, []);

  const clearAll = useCallback(async () => {
    setItems([]);
    setUnread(0);
    await api.delete("/notifications").catch(() => {});
  }, []);

  const value = useMemo(
    () => ({ items, unread, loading, markRead, markAllRead, clearAll }),
    [items, unread, loading, markRead, markAllRead, clearAll]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export const useNotifications = () => useContext(NotificationContext);
