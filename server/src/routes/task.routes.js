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
const {apiLimiter} = require("../middleware/rateLimit.middleware");
const requireAtleastOneField = require("../middleware/requireAtleastOneField.middleware");
const allowedFields = require("../middleware/allowedFields.middleware");

router.use(apiLimiter);

router.use(authMiddleware);

router.post("/", requireAtleastOneField, allowedFields(["title", "description", "deadline"]), createTaskValidator, validationMiddleware, createTaskController);

router.get("/", getTasksController);

router.get("/:id", getTaskByIdController);

router.patch("/:id", requireAtleastOneField, allowedFields(["title", "description", "completed", "deadline"]), updateTaskValidator, validationMiddleware, updateTaskController);

router.delete("/:id", deleteTaskController);

module.exports = router; 