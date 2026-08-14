const Comment = require("../models/Comment");

// ADD COMMENT
exports.addComment = async (req, res) => {
  try {
    const comment = await Comment.create({
      text: req.body.text,
      task: req.body.taskId,
      user: req.user._id,
    });

    const io = req.app.get("io");

    io.to(req.body.projectId).emit("commentAdded", comment);

    const notification = await createNotification(
      req.user._id,
      "New comment added to a task",
      "comment"
    );

    io.to(req.user._id.toString()).emit("notification", notification);

    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET COMMENTS FOR TASK
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find({
      task: req.params.taskId,
    })
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};