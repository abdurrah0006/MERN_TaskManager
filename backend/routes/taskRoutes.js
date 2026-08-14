const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  deleteTask,
} = require("../controllers/taskController");

router.post("/", protect, createTask);
router.get("/:projectId", protect, getTasksByProject);
router.put("/:id", protect, updateTaskStatus);
router.delete("/:id", protect, deleteTask);

module.exports = router;