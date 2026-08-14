import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  autoConnect: false,
});

export function initSocket(userId) {
  if (!socket.connected) {
    socket.connect();
  }

  if (userId) {
    socket.emit("joinUser", userId);
  }

  return socket;
}

export default socket;
