const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const {
  registerUser,
  loginUser,
  getMe,
  updateProfile,
  changePassword,
} = require("../controllers/authController");

router.post("/register", registerUser);
router.post("/login", loginUser);

router.get("/me", protect, getMe);
router.put("/me", protect, updateProfile);
router.put("/password", protect, changePassword);

module.exports = router;
