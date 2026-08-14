const Task = require("../models/Task");

const createNotification = require("../utils/createNotification");

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      description: req.body.description,
      project: req.body.projectId,
      status: req.body.status || "To Do",
    });

    const io = req.app.get("io");

    // 🔥 real-time update
    io.to(req.body.projectId).emit("taskCreated", task);

    // 🔔 notification (for demo: notify creator or all members later)
    const notification = await createNotification(
      req.user._id,
      `Task "${task.title}" created`
    );

    io.to(req.user._id.toString()).emit("notification", notification);

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET TASKS BY PROJECT
exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({
      project: req.params.projectId,
    });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE TASK STATUS (MOVE CARD)
exports.updateTaskStatus = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    task.status = req.body.status;
    await task.save();

    const io = req.app.get("io");

    io.to(task.project.toString()).emit("taskUpdated", task);

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE TASK
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    await task.deleteOne();

    const io = req.app.get("io");

    io.to(task.project.toString()).emit("taskDeleted", task._id);

    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};