const express = require('express');
const router = express.Router();

const { 
    fetchGames, 
    gamePage, 
    addGame, 
    checkGame, 
    removeGame, 
    fetchList, 
    fetchRandom,
    fetchTopGamesThisYear
} = require("../controllers/moby");

router.route("/retrieve").get(fetchGames);
router.route("/random").get(fetchRandom);
router.route("/current").get(fetchTopGamesThisYear);
router.route("/info").get(gamePage);
router.route("/add").post(addGame);
router.route("/check").get(checkGame);
router.route("/remove").get(removeGame);
router.route("/backlog").get(fetchList);

module.exports = router;