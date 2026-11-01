const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API_BASE = `${API_URL}/api`;
export const SOCKET_URL = API_URL;

export const getToken = () => localStorage.getItem("token");

async function request(method, path, body) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new Error("Can't reach the server. Check that the backend is running.");
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    // An expired or invalid session: let the auth context sign the user out.
    if (response.status === 401 && token) window.dispatchEvent(new Event("auth:expired"));
    throw new Error(data?.message || "Request failed");
  }
  return data;
}

export const api = {
  get: (path) => request("GET", path),
  post: (path, body) => request("POST", path, body ?? {}),
  put: (path, body) => request("PUT", path, body ?? {}),
  patch: (path, body) => request("PATCH", path, body ?? {}),
  delete: (path) => request("DELETE", path),
};
