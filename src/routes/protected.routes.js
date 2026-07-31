const { Router } = require("express");
const requireAuth = require("../middleware/auth.middleware");

const router = Router();

router.use(requireAuth);

/**
 * @openapi
 * /protected/profile:
 *   get:
 *     tags: [Protected]
 *     summary: Get the authenticated user's profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile (id, email, created_at)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 email:
 *                   type: string
 *                 created_at:
 *                   type: string
 *       401:
 *         description: Missing or invalid token
 */
router.get("/profile", (req, res) => {
    const { id, email, created_at } = req.user;
    res.status(200).json({ id, email, created_at });
});

/**
 * @openapi
 * /protected/dashboard:
 *   get:
 *     tags: [Protected]
 *     summary: Get the authenticated user's dashboard
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Welcome message for authenticated user
 *       401:
 *         description: Missing or invalid token
 */
router.get("/dashboard", (req, res) => {
    res.status(200).json({
        message: `Welcome to your dashboard, ${req.user.email}!`,
    });
});

module.exports = router;
