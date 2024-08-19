// Import User model
const User  = require('../data/user');

const path = require('path');

// Import bcrypt for password hashing
const bcrypt = require('bcrypt');

// Import JsonWebToken
const jwt = require('jsonwebtoken');

// Secret key
const jwtSecret = '7184a7e0aa374816e3ffea4f11dc52321c9c89591b198e2084c15aab74ea9de57e3771s';

const maxAge = 4 * 60 * 60;

// Function to generate token
function generateToken(user) {
    // Calculate time till token expires

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        jwtSecret,
        {
            expiresIn: maxAge, 
        }
    );

    return token;
}

// Register function to be used in server.js
const register = async (req, res, next) => {
    // Retrieve username and password from request body
    const { username, password } = req.body;

    if (password.length < 8) {
        return res.status(400).json({ 
            message: "Password cannot be less than 8 characters" 
        });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    // Create a new user
    try {
        // Check if username already exists
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("Username already exists");
            return res.status(400).json({
                message: "Username already exists"
            });
        }

        // Await new user creation (pause function until promise is settled)
        const user = await User.create({
            username,
            password: hashPassword,
        });

        const token = generateToken(user);

        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge  * 1000, // 5 hours in ms
        });

        // Send 200 OK status response to client
        res.status(200).json({
            message: "User successfully created",
            username: user,
        });
        
        sessionStorage.setItem("user_id", user.id);

    // Send 401 Unauthorized response
    } catch (err) {
        res.status(500).json({
            message: "User not created",
            error: err.message,
        });
    }
}

// Login function to be used in server.js
const login = async (req, res, next) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({
            message: "Username or password not present",
        });
    }

    try {
        // Usernames are unique
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                message: "Login not successful",
                error: "User not found",
            });
        } 

        // Compare password with hashed password in db
        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({
                message: "Login unsuccessful",
                user, 
            });
        }

        // Call function to generate token
        const token = generateToken(user);

        res.cookie("jwt", token, {
            httpOnly: true,
            maxAge: maxAge * 1000, // 5 hours in ms
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

// Function to update users role 
const update = async (req, res, next) => {
    const { role, id } = req.body;
    
    if (!role || !id ) {
        return req.status(400).json({ 
            message: "Request missing role or id" 
        });
    }

    if (role !== "admin") {
        return req.status(400).json({ 
            message: "Role is not admin" 
        });
    }

    try {
        const user = await User.findById(id);
        
        if (!user) {
            return res.status(404).json({ 
                message: "User not found" 
            });
        }

        // Ensure that user is not already an admin
        if (user.role === "admin") {
            return res.status(400).json({ 
                message: "User is already an Admin" 
            });
        }

        // Assign the role of admin to user
        user.role = role;

        // Save updated user
        const updatedUser = await user.save();

        // Send response indicating that user role has been updated successfully
        res.status(201).json({ 
            message: "Update successful", 
            updatedUser 
        });
        
    } catch (err) {
        res.status(400).json({ 
            message: "An error occurred", 
            error: err.meesage 
        });
    }
}

// Function to delete user from db
const deleteUser = async (req, res, next) => {
    // Extract users id from body
    const { id } = req.body;

    try {
        // Find user by id
        const user = await User.findById(id);

        // Handle case where user does not exist
        if (!user) {
            return res.status(404).json({ 
                message: "User not found" 
            });
        }

        // Delete user from database
        await user.deleteOne();

        // Send response indicating that deletion was successful
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

const adminAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        console.log("Token is here!")
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
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

const userAuth = (req, res, next) => {
    const token = req.cookies.jwt;
    if (token) {
        jwt.verify(token, jwtSecret, (err, decodedToken) => {
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

// Function to check whether user is logged in - redirect to home page if so
const verifyAuth = (req, res, next) => {
    // Retrieve token from req header
    const token = req.cookies.jwt;

    // If there is no token, proceed to the next middle/route handler
    if (!token) {
        return next();
    }

    jwt.verify(token, jwtSecret, (err, decodedToken) => {
        if (err) {
            // If token verification fails, proceed to the next middleware/route handler
            return next();
        }

        // If token is valid, redirect to home page
        res.redirect('/home');
    })
}

// Export register function
module.exports = { 
    register,
    login,
    update, 
    deleteUser,
    adminAuth, 
    userAuth,
    verifyAuth
};