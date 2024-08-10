const express = require('express');

const router = express.Router();

const { register, login, update, deleteUser, adminAuth } = require("../middleware/auth");

// Route handlers
router.route("/register").post(register);

router.route("/login").post(login);

router.route("/update").put(adminAuth, update);

router.route("/deleteUser").delete(adminAuth, deleteUser);


module.exports = router;