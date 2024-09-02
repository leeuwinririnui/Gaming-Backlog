const express = require('express');
const path = require('path');
const { userAuth, verifyAuth } = require('../middleware/auth');
const router = express.Router();

router.get('/', userAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'views', 'home.html'));
});

router.get('/search', userAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'views', 'search.html'));
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

router.get('/list', userAuth, (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'views', 'list.html'));
});

module.exports = router;
