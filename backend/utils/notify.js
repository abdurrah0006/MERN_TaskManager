const Notification = require("../models/Notification");
const { userRoom } = require("../sockets/socket");

/**
 * Create a notification for each user and push it over their socket room.
 * Callers are responsible for leaving out the user who triggered the action.
 */
const notify = async (io, userIds, { message, type = "system", link = "" }) => {
  const ids = [...new Set(userIds.filter(Boolean).map(String))];
  if (ids.length === 0) return;

  const created = await Notification.insertMany(
    ids.map((user) => ({ user, message, type, link }))
  );
  created.forEach((n) => io.to(userRoom(n.user)).emit("notification", n));
};

module.exports = notify;
