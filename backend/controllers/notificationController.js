const mongoose = require("mongoose");
const Notification = require("../models/Notification");
const HttpError = require("../utils/HttpError");

exports.getNotifications = async (req, res) => {
  const [notifications, unread] = await Promise.all([
    Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50),
    Notification.countDocuments({ user: req.user._id, read: false }),
  ]);
  res.json({ notifications, unread });
};

exports.markRead = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw new HttpError(404, "Notification not found");
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: req.user._id },
    { read: true },
    { new: true }
  );
  if (!notification) throw new HttpError(404, "Notification not found");
  res.json(notification);
};

exports.markAllRead = async (req, res) => {
  await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
  res.json({ message: "All notifications marked as read" });
};

exports.clearAll = async (req, res) => {
  await Notification.deleteMany({ user: req.user._id });
  res.json({ message: "Notifications cleared" });
};
