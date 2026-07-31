const { Router } = require("express");
const supabase = require("../config/supabase");

const router = Router();

router.get("/profile", async (req, res) => {
    const authHeader = req.headers["authorization"];

    // Check header exists and is well-formed
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

    // Ask Supabase to verify the token — this is a real network call
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
        return res.status(401).json({
            error: "Invalid or expired token",
        });
    }

    // Return only safe metadata — never expose sensitive fields
    const { id, email, created_at } = data.user;

    res.status(200).json({ id, email, created_at });
});

module.exports = router;
