const express = require("express");
const router = express.Router();
const {
  loginUser,
  registerUser,
  changePassword,
  getUsers,
} = require("../controllers/auth-controller");
const authMiddleware = require("../middleware/auth-middleware");

router.get("/users", getUsers);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/change-password", authMiddleware, changePassword);

module.exports = router;
