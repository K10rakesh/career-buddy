const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))

app.use(express.json());
app.use(cookieParser());

const taskRoutes = require("./routes/task.routes");
const authRoutes = require('./routes/auth.routes');

app.use("/api/tasks", taskRoutes);

app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
    res.send("Taskly API is running");
})

module.exports = app;