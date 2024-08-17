// Routes to handle game middleware
const express = require('express');

const router = express.Router();

const { fetchGame, gamePage, addGame, checkGame, removeGame } = require("../controllers/moby");

// Route handlers

// Retrieve game information for list
router.route("/retrieve").get(fetchGame);

// Retrieve game information from dedicated page
router.route("/info").get(gamePage);

// Add game to users backlog
router.route("/add").post(addGame);

// Check if game is in users list
router.route("/check").get(checkGame);

// Remove game from users list
router.route("/remove").get(removeGame);

// Exports routes
module.exports = router;