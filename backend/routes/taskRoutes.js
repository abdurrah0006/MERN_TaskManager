const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const c = require("../controllers/taskController");

router.use(protect);

router.post("/", c.createTask);
router.get("/mine", c.getMyTasks);
router.get("/project/:projectId", c.getTasksByProject);
router.route("/:id").put(c.updateTask).delete(c.deleteTask);

module.exports = router;
