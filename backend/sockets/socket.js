const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../models/User");
const Project = require("../models/Project");

const projectRoom = (id) => `project:${id}`;
const userRoom = (id) => `user:${id}`;

const initSockets = (httpServer, origins) => {
  const io = new Server(httpServer, {
    cors: { origin: origins, methods: ["GET", "POST"] },
  });

  // Only authenticated users may connect.
  io.use(async (socket, next) => {
    try {
      const { id } = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET);
      const user = await User.exists({ _id: id });
      if (!user) throw new Error("Unknown user");
      socket.userId = String(id);
      next();
    } catch {
      next(new Error("Not authorized"));
    }
  });

  io.on("connection", (socket) => {
    socket.join(userRoom(socket.userId));

    // Only project members may listen to a project's events.
    socket.on("joinProject", async (projectId) => {
      if (!mongoose.isValidObjectId(projectId)) return;
      const isMember = await Project.exists({ _id: projectId, members: socket.userId });
      if (isMember) socket.join(projectRoom(projectId));
    });

    socket.on("leaveProject", (projectId) => socket.leave(projectRoom(projectId)));
  });

  return io;
};

module.exports = { initSockets, projectRoom, userRoom };
