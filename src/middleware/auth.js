const User  = require('../data/user');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;
const { generateToken } = require('../util.js');

// Register and store user information in db
const register = async (req, res, next) => {
    const { username, password } = req.body;

    if (password.length < 8) {
        return res.status(400).json({ 
            message: "Password cannot be less than 8 characters" 
        });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            console.log("User already exists");
            return res.status(400).json({
                message: "User already exists"
            });
        }

        const user = await User.create({
            username,
            password: hashPassword,
        });

        const token = generateToken(user);

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

// Log user in with jwt token
const login = async (req, res, next) => {
    const { username, password } = req.body

    if (!username || !password) {
        return res.status(400).json({
            message: "Username or password not present",
        });
    }

    try {
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(401).json({
                message: "Login not successful",
                error: "User not found",
            });
        } 

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            return res.status(401).json({
                message: "Login unsuccessful",
                user, 
            });
        }

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

        if (user.role === "admin") {
            return res.status(400).json({ 
                message: "User is already an Admin" 
            });
        }

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

// Delete user from db
const deleteUser = async (req, res, next) => {
    const { id } = req.body;

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ 
                message: "User not found" 
            });
        }
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

// Authorise admin
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

// Authorise user
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

// Check whether user is logged in
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