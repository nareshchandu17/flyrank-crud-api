const { Router } = require("express");

const router = Router();

router.get("/info", (req, res) => {
    res.status(200).json({
        message: "Welcome stranger! This info is public.",
    });
});

module.exports = router;
