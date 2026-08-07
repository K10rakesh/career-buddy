const express = require("express");
const app = express();
app.use(express.json());
const taskRoutes = require("./routes/task.routes");
const authRoutes = require('./routes/auth.routes');

app.use("/api/tasks", taskRoutes);

app.use("/api/auth", authRoutes);

app.get("/health", (req, res) => {
    res.send("Taskly API is running");
})

module.exports = app;