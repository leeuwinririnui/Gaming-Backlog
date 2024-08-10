const express = require('express');

const router = express.Router();

const { fetchGame } = require("../middleware/moby");

// Route handlers
router.route("/retrieve").get(fetchGame);

module.exports = router;