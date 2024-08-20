// Routes to handle game middleware
const express = require('express');

const router = express.Router();

const { fetchGame, gamePage, addGame, checkGame, removeGame, fetchBacklog, searchList } = require("../controllers/moby");

// Route handlers

// Retrieve games based on search
router.route("/retrieve").get(fetchGame);

// Retrieve game information for dedicated page
router.route("/info").get(gamePage);

// Add game to users backlog
router.route("/add").post(addGame);

// Check if game is in users list
router.route("/check").get(checkGame);

// Remove game from users list
router.route("/remove").get(removeGame);

// Fetch users list of games to display
router.route("/backlog").get(fetchBacklog);

// Filter users list based on searched title
router.route("/search").get(searchList);

// Exports routes
module.exports = router;