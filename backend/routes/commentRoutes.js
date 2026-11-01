const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const c = require("../controllers/commentController");

router.use(protect);

router.post("/", c.addComment);
router.get("/:taskId", c.getComments);
router.delete("/:id", c.deleteComment);

module.exports = router;
