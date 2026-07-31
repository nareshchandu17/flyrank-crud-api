const { Router } = require("express");

const router = Router();

/**
 * @openapi
 * /public/info:
 *   get:
 *     tags: [Public]
 *     summary: Public info endpoint — no auth required
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Welcome stranger! This info is public."
 */
router.get("/info", (req, res) => {
    res.status(200).json({
        message: "Welcome stranger! This info is public.",
    });
});

module.exports = router;
