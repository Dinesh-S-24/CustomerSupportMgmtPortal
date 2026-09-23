const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        // Check Authorization header
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: "Authorization header is required",
                errors: []
            });
        }

        // Check Bearer format
        if (!authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Invalid authorization format",
                errors: []
            });
        }

        // Extract token
        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is required",
                errors: []
            });
        }
        

        // Verify JWT
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        console.log("Decoded JWT:", decoded);

        // IMPORTANT:
        // Login creates `userId`, not `id`
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists",
                errors: []
            });
        }

        // Check active status
       
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: "User account is inactive",
                errors: []
            });
        }

        // Attach authenticated user to request
        req.user = {
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role
        };

        next();

    } catch (error) {

        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                success: false,
                message: "Token expired",
                errors: []
            });
        }

        if (error.name === "JsonWebTokenError") {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
                errors: []
            });
        }

        console.error("Authentication error:", error);

        return res.status(500).json({
            success: false,
            message: "Authentication failed",
            errors: []
        });
    }
};

module.exports = authenticate;