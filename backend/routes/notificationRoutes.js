const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const c = require("../controllers/notificationController");

router.use(protect);

router.route("/").get(c.getNotifications).delete(c.clearAll);
router.patch("/read-all", c.markAllRead);
router.patch("/:id/read", c.markRead);

module.exports = router;
