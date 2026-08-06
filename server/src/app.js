const express = require("express");
const app = express();
app.use(express.json());
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require('./routes/authRoutes');

app.use("/api/tasks", taskRoutes);

app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
    res.send("Taskly API is running");
})

module.exports = app;