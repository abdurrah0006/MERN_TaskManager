const Notification = require("../models/Notification");

const createNotification = async (userId, message, type = "system") => {
  const notification = await Notification.create({
    user: userId,
    message,
    type,
  });

  return notification;
};

module.exports = createNotification;