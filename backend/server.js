
require("dotenv").config();

const cors = require("cors");
const taskRoutes = require("./routes/taskRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Middleware
app.use(express.json());

app.use(cors());
app.use("/api/tasks", taskRoutes);
app.use("/api/uploads", uploadRoutes);

// Basic test route
app.get("/", (req, res) => {
    res.send("DataEngine API is running");
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await connectDB();

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();
