// Routes to handle html pages

const express = require('express');

const path = require('path');
const { userAuth, verifyAuth } = require('../middleware/auth');

const router = express.Router();

// Route handlers
router.get('/', userAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'views', 'home.html'));
});

router.get('/login', verifyAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'views', 'login.html'));
});

router.get('/register', verifyAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'views', 'register.html'));
});

router.get('/game', userAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'views', 'game.html'));
});

module.exports = router;
