import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { api, getToken } from "../api";
import { connectSocket, disconnectSocket } from "../socket";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [socket, setSocket] = useState(null);

  const signOut = useCallback(() => {
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const signIn = useCallback(({ token, user: nextUser }) => {
    localStorage.setItem("token", token);
    setUser(nextUser);
  }, []);

  // Restore the session on first load.
  useEffect(() => {
    if (!getToken()) return;
    api
      .get("/auth/me")
      .then((data) => setUser(data.user))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    window.addEventListener("auth:expired", signOut);
    return () => window.removeEventListener("auth:expired", signOut);
  }, [signOut]);

  // One socket per signed-in user.
  const userId = user?._id;
  useEffect(() => {
    if (!userId) return;
    setSocket(connectSocket());
    return () => {
      disconnectSocket();
      setSocket(null);
    };
  }, [userId]);

  const value = useMemo(
    () => ({ user, setUser, loading, socket, signIn, signOut }),
    [user, loading, socket, signIn, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
