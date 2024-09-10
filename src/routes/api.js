const express = require('express');
const router = express.Router();
const { register, login, update, deleteUser, adminAuth } = require("../middleware/auth");

// Define routes for user authentication and management

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/update").put(adminAuth, update);
router.route("/deleteUser").delete(adminAuth, deleteUser);

module.exports = router;