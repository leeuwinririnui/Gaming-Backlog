// Routes to handle game middleware

const express = require('express');

const router = express.Router();

const { fetchGame, gamePage } = require("../middleware/moby");

// Route handlers
router.route("/retrieve").get(fetchGame);

router.route("/info").get(gamePage);

module.exports = router;