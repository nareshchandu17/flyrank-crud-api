const { Router } = require("express");
const { signup, login, logout } = require("../controllers/auth.controller");
const requireAuth = require("../middleware/auth.middleware");

const router = Router();

router.post("/signup", signup);
router.post("/login",  login);
router.post("/logout", requireAuth, logout);  // guard applied only here

module.exports = router;
