const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


// ===============================
// REGISTER
// ===============================
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required",
                errors: []
            });
        }

        // Clean values
        const cleanName = name.trim();
        const cleanEmail = email.trim().toLowerCase();

        // Name validation
        const nameRegex = /^[A-Za-z ]+$/;

        if (!nameRegex.test(cleanName)) {
            return res.status(400).json({
                success: false,
                message: "Name can contain only letters and spaces",
                errors: []
            });
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(cleanEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please provide a valid email address",
                errors: []
            });
        }

        // Password validation
        if (password.length < 8) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 8 characters",
                errors: []
            });
        }

        // Check whether email already exists
        const existingUser = await User.findOne({
            email: cleanEmail
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered",
                errors: []
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 12);

        // Create user
        // IMPORTANT:
        // Public registration always creates CUSTOMER.
        // User cannot register themselves as admin/agent.
        const user = await User.create({
            name: cleanName,
            email: cleanEmail,
            passwordHash,
            role: "customer",
            isActive: true
        });

        return res.status(201).json({
            success: true,
            message: "Registration successful",
            data: {
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            }
        });

    } catch (error) {
        console.error("Register Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: [error.message]
        });
    }
};


// ===============================
// LOGIN
// ===============================
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required",
                errors: []
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        // Find user
        const user = await User.findOne({
            email: cleanEmail
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
                errors: []
            });
        }

        // Check account status
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account is inactive",
                errors: []
            });
        }

        // Compare password with bcrypt hash
        const isPasswordValid = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password",
                errors: []
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                userId: user._id.toString(),
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || "1d"
            }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: {
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
            errors: [error.message]
        });
    }
};


module.exports = {
    register,
    login
};