import { io } from "socket.io-client";
import { SOCKET_URL, getToken } from "./api";

let socket = null;

export function connectSocket() {
  if (!socket) {
    socket = io(SOCKET_URL, { auth: (cb) => cb({ token: getToken() }) });
  }
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
