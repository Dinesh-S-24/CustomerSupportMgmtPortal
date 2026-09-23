require("dotenv").config();

const bcrypt = require("bcryptjs");

const connectDatabase = require("./config/database");

const User = require("./models/User");

const seedUsers = async () => {
    try {
        await connectDatabase();

        const passwordHash = await bcrypt.hash(
            "Password@123",
            12
        );

        const users = [
            {
                name: "CSMS Admin",
                email: "admin@csms.com",
                passwordHash,
                role: "admin",
                isActive: true
            },
            {
                name: "Support Agent",
                email: "agent@csms.com",
                passwordHash,
                role: "agent",
                isActive: true
            },
            {
                name: "Test Customer",
                email: "customer@csms.com",
                passwordHash,
                role: "customer",
                isActive: true
            }
        ];

        for (const userData of users) {
            const existingUser = await User.findOne({
                email: userData.email
            });

            if (!existingUser) {
                await User.create(userData);

                console.log(
                    `Created: ${userData.email}`
                );
            } else {
                console.log(
                    `Already exists: ${userData.email}`
                );
            }
        }

        console.log("Seed completed");

        process.exit(0);
    } catch (error) {
        console.error(
            "Seed failed:",
            error
        );

        process.exit(1);
    }
};

seedUsers();