const User  = require('../data/user');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const { generateToken } = require('../util.js');

// Register and store user information in database
const register = async (req, res, next) => {
    const { username, password } = req.body;

    // Validate password length
    if (password.length < 8) {
        return res.status(400).json({ 
            message: "Password cannot be less than 8 characters" 
        });
    }

    // Hash password for secure storage
    const hashPassword = await bcrypt.hash(password, 10);

    try {
        // Chekc if user already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("User already exists");
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Create new user with hashed password
        const user = await User.create({
            username,
            password: hashPassword,
        });

        // Generate JWT token for the user
        const token = generateToken(user);

        // Set JWT token in a cookie
        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 4 * 60 * 60  * 1000,
        });
        
        res.status(200).json({
            message: "User successfully created",
            username: user,
        });

    } catch (err) {
        res.status(500).json({
            message: "User not created",
            error: err.message,
        });
    }
}

// Log user in with JWT token
const login = async (req, res, next) => {
    const { username, password } = req.body

    // Check if username and password are provided
    if (!username || !password) {
        return res.status(400).json({
            message: "Username or password not present",
        });
    }

    try {
        // Find user by username
        const user = await User.findOne({ username });

        // Return error if User was not found
        if (!user) {
            return res.status(401).json({
                message: "Login not successful",
                error: "User not found",
            });
        } 

        // Compare provided password with stored hash
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({
                message: "Login unsuccessful",
                user, 
            });
        }

        // Generate JWT token for user
        const token = generateToken(user);

        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: 4 * 60 * 60 * 1000, 
        });

        res.status(200).json({
            message: "Login successful",
            user,
        });

    } catch(error) {
        res.status(400).json({
            message: "An error occurred",
            error: error.message,
        });
    }
}

// Update role of user
const update = async (req, res, next) => {
    const { role, id } = req.body;
    
    // Check if role and id are provided
    if (!role || !id ) {
        return req.status(400).json({ 
            message: "Request missing role or id" 
        });
    }

    // Only allow role update to 'admin'
    if (role !== "admin") {
        return req.status(400).json({ 
            message: "Role is not admin" 
        });
    }

    try {
        // Find the user by id
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ 
                message: "User not found" 
            });
        }

        // Check if user is already an admin
        if (user.role === "admin") {
            return res.status(400).json({ 
                message: "User is already an Admin" 
            });
        }

        // Update user's role
        user.role = role;
        const updatedUser = await user.save();

        res.status(201).json({ 
            message: "Update successful", 
            updatedUser 
        });
        
    } catch (err) {
        res.status(400).json({ 
            message: "An error occurred", 
            error: err.message 
        });
    }
}

// Delete user from database
const deleteUser = async (req, res, next) => {
    const { id } = req.body;

    try {
        // Find the user by id
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ 
                message: "User not found" 
            });
        }

        // Delete user
        await user.deleteOne();

        res.status(201).json({ 
            message: "User successfully deleted", 
            user 
        });

    } catch (err) {
        res.status(400).json({ 
            message: "An error occurred", 
            error: err.message 
        });
    }
}

// Authorise admin based on JWT token
const adminAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        console.log("Token is here!")
        jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
            if (err) {
                return res.status(401).json({ message: "Not authorized" });
            } else {
                if (decodedToken.role !== "admin") {
                    return res.status(401).json({ message: "Not authorized" });
                } else {
                    next();
                }
            }
        });  
    } else {
        return res.status(401).json({ message: "Not authorized, token not available" });
    }
}

// Authorise user based on JWt token
const userAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
            if (err) {
                return res
                    .status(401)
                    .sendFile(path.join(__dirname, '..', '..', 'views', 'unauthorized.html'));
            } else {
                if (decodedToken.role !== "basic") {
                    return res
                        .status(401)
                        .sendFile(path.join(__dirname, '..', '..', 'views', 'unauthorized.html'));
                } else {
                    next();
                }
            }
        });  
    } else {
        return res
            .status(401)
            .sendFile(path.join(__dirname, '..', '..', 'views', 'login.html'));
    }
}

// Check whether user is logged in and redirect if so
const verifyAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (!token) {
        return next();
    }

    jwt.verify(token, JWT_SECRET, (err, decodedToken) => {
        if (err) {
            return next();
        }

        res.redirect('/home');
    })
}

module.exports = { 
    register,
    login,
    update, 
    deleteUser,
    adminAuth, 
    userAuth,
    verifyAuth
};