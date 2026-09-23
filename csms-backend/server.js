require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");
const PORT = process.env.PORT || 4000;
const startServer = async () => {
    try {
        await connectDatabase();

        app.listen(PORT, () => {
            console.log(
                `CSMS server running on http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error(
            "Server startup failed:",
            error.message
        );

        process.exit(1);
    }
};

startServer();