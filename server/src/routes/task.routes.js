const express = require("express");
const router = express.Router();
const {
    createTaskController, 
    getTasksController, 
    getTaskByIdController, 
    updateTaskController, 
    deleteTaskController
} = require("../controllers/task.controller");
const {createTaskValidator, updateTaskValidator} = require('../validators/task.validator');
const validationMiddleware = require('../middleware/validation.middleware');
const authMiddleware = require("../middleware/auth.middleware");

router.post("/", authMiddleware, createTaskValidator, validationMiddleware, createTaskController);

router.get("/", authMiddleware, getTasksController);

router.get("/:id", authMiddleware, getTaskByIdController);

router.patch("/:id", authMiddleware, updateTaskValidator, validationMiddleware, updateTaskController);

router.delete("/:id", authMiddleware, deleteTaskController);

module.exports = router; 