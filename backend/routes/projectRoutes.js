const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const c = require("../controllers/projectController");

router.use(protect);

router.route("/").get(c.getProjects).post(c.createProject);
router.route("/:id").get(c.getProject).put(c.updateProject).delete(c.deleteProject);

router.post("/:id/members", c.addMember);
router.delete("/:id/members/:userId", c.removeMember);

router.post("/:id/columns", c.addColumn);
router.route("/:id/columns/:name").put(c.renameColumn).delete(c.deleteColumn);

module.exports = router;
