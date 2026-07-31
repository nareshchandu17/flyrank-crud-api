const { Router } = require("express");

const router = Router();

router.get("/profile", (req, res) => {
    const authHeader = req.headers["authorization"];

    // Header must exist and be in the form "Bearer <token>"
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Access token required",
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            error: "Access token required",
        });
    }

    // Token was presented — not verified yet, just acknowledged
    res.status(200).json({
        message: "Token received (not yet verified).",
        token,
    });
});

module.exports = router;
