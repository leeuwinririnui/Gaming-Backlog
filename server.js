const path = require('path');
const express = require('express');
const http = require('http');
const cookieParser = require('cookie-parser');

// Create an Express application
const app = express();

// Middleware setup
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Import routes 
const pageRoutes = require('./src/routes/page.js');
const apiRoutes = require('./src/routes/api.js');
const gameRoutes = require('./src/routes/game.js');

// Connect to MongoDB
const connectDB = require('./src/data/db.js');
connectDB();

// Use routes
app.use('/', pageRoutes);
app.use('/api/auth', apiRoutes);
app.use('/api/game', gameRoutes);

// Logout route
app.get('/logout', (req, res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/login');
});

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(8080, () => {
    console.log('Server is running on port', server.address().port);
});

// Error handling for unhandled promise rejections
process.on('unhandledRejection', err => {
    console.log('An error occurred:', err.message);
    server.close(() => process.exit(1));
});