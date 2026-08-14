const express = require("express");
const router = express.Router();

const protect = require("../middleware/authMiddleware");

const {
  addComment,
  getComments,
} = require("../controllers/commentController");

router.post("/", protect, addComment);
router.get("/:taskId", protect, getComments);

module.exports = router;