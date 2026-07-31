const { Router } = require("express");
const requireAuth = require("../middleware/auth.middleware");

const router = Router();

// Apply the guard to every route in this router
router.use(requireAuth);

router.get("/profile", (req, res) => {
    const { id, email, created_at } = req.user;
    res.status(200).json({ id, email, created_at });
});

router.get("/dashboard", (req, res) => {
    res.status(200).json({
        message: `Welcome to your dashboard, ${req.user.email}!`,
    });
});

module.exports = router;
