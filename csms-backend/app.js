const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const messageRoutes = require("./routes/messageRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/

app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "CSMS API is running",
        data: {}
    });
});

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
*/

app.use("/api/auth", authRoutes);

app.use("/api/tickets", ticketRoutes);

app.use("/api", messageRoutes);

app.use(
    "/api/dashboard",
    dashboardRoutes
);

/*
|--------------------------------------------------------------------------
| 404
|--------------------------------------------------------------------------
*/

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "API endpoint not found",
        errors: []
    });
});

/*
|--------------------------------------------------------------------------
| Error Handler
|--------------------------------------------------------------------------
*/

app.use((error, req, res, next) => {
    console.error(error);

    res.status(500).json({
        success: false,
        message: "Internal server error",
        errors: []
    });
});






// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "CSMS API is running",
        data: {}
    });
});


// Auth APIs
app.use("/api/auth", authRoutes);


module.exports = app;