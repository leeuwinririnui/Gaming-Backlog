const express = require('express');
const router = express.Router();

const { 
    fetchGame, 
    gamePage, 
    addGame, 
    checkGame, 
    removeGame, 
    fetchList, 
} = require("../controllers/moby");

router.route("/retrieve").get(fetchGame);
router.route("/info").get(gamePage);
router.route("/add").post(addGame);
router.route("/check").get(checkGame);
router.route("/remove").get(removeGame);
router.route("/backlog").get(fetchList);

module.exports = router;