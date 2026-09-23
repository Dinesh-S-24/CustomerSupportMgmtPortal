const bcrypt = require("bcryptjs");
const User = require("../models/User");

const register = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phoneNumber,
            gender,
            userType,
            password
        } = req.body;

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phoneNumber ||
            !gender ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields are required"
            });
        }

        const existingUser = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: "Email already registered"
            });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            phoneNumber,
            gender,
            userType: userType || "customer",
            passwordHash
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phoneNumber: user.phoneNumber,
                gender: user.gender,
                userType: user.userType,
                status: user.status,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error("Register error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

module.exports = {
    register
};