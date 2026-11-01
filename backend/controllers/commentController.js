const Comment = require("../models/Comment");
const HttpError = require("../utils/HttpError");
const notify = require("../utils/notify");
const { sameId, getTaskAsMember } = require("../utils/access");
const { projectRoom } = require("../sockets/socket");

exports.addComment = async (req, res) => {
  const { task, project } = await getTaskAsMember(req.body.taskId, req.user._id);

  const comment = await Comment.create({
    text: req.body.text,
    task: task._id,
    project: project._id,
    user: req.user._id,
  });
  await comment.populate("user", "name email");

  const io = req.app.get("io");
  io.to(projectRoom(project._id)).emit("commentAdded", comment);

  const recipients = [task.assignedTo, task.createdBy].filter(
    (id) => id && !sameId(id, req.user._id)
  );
  await notify(io, recipients, {
    message: `${req.user.name} commented on "${task.title}"`,
    type: "comment",
    link: `/projects/${project._id}`,
  });

  res.status(201).json(comment);
};

exports.getComments = async (req, res) => {
  const { task } = await getTaskAsMember(req.params.taskId, req.user._id);
  const comments = await Comment.find({ task: task._id })
    .populate("user", "name email")
    .sort({ createdAt: 1 });
  res.json(comments);
};

exports.deleteComment = async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) throw new HttpError(404, "Comment not found");

  const { project } = await getTaskAsMember(comment.task, req.user._id);
  const canDelete = sameId(comment.user, req.user._id) || sameId(project.owner, req.user._id);
  if (!canDelete) throw new HttpError(403, "You can only delete your own comments");

  await comment.deleteOne();
  req.app.get("io").to(projectRoom(project._id)).emit("commentDeleted", {
    _id: comment._id,
    task: comment.task,
  });

  res.json({ message: "Comment deleted" });
};
