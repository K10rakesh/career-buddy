const Task = require("../models/Task");
const Tag = require("../models/Tag");
const mongoose = require("mongoose");

const createTaskController = async (req, res) => {
    try{
        if (req.validatedData.tags){
            const tags = await Tag.find({
                _id: {$in: req.validatedData.tags},
                userId: req.userId
            });
            const userTagIds = new Set(tags.map((tag) => tag.id));
            const allTagsBelongToUser = req.validatedData.tags.every(
                tagId => userTagIds.has(tagId)
            );
            if (!allTagsBelongToUser){
                return res.status(400).json({
                    message: "One or more tags are invalid."
                });
            }
        }
        const task = new Task({
            ...req.validatedData,
            userId: req.userId
        });
        await task.save(); 
        res.status(201).json(task);
    }
    catch(err){
        console.error(err);
        res.status(500).json({
            message: "Error creating new task."
        });
    }
}

const getTasksController = async (req, res) => {
    try{
        const userTasks = await Task.find({userId: req.userId});
        res.status(200).json({
            tasks: userTasks
        });
    }
    catch (err){
        console.error(err);
        return res.status(500).json({
            "message": "Failed to retrieve tasks."
        });
    }
}

const getTaskByIdController = async (req, res) => {
    try{
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }
        const userTask = await Task.findOne({
            userId: req.userId,
            _id: req.params.id
        });
        if (!userTask){
            return res.status(404).json({
                "message": "Task not found."
            });
        }
        res.status(200).json({
            task: userTask
        });
    }
    catch (err){
        console.error(err);
        return res.status(500).json({
            "message": "Failed to retrieve task."
        });
    }
}

const updateTaskController = async (req, res) => {
    try{
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }
        const taskId = req.params.id;
        const user = req.userId;
        const userTask = await Task.findOne({
            _id: taskId,
            userId: user
        });
        if (!userTask){
            return res.status(404).json({
                "message": "Task not found."
            });
        }
        if (req.validatedData.title !== undefined){
            userTask.title = req.validatedData.title;
        }
        if (req.validatedData.description !== undefined){
            userTask.description = req.validatedData.description;
        }
        if (req.validatedData.completed !== undefined){
            userTask.completed = req.validatedData.completed;
        }
        if (req.validatedData.deadline !== undefined){
            userTask.deadline = req.validatedData.deadline;
        }
        if (req.validatedData.priority !== undefined){
            if (!req.validatedData.priority){
                userTask.priority = undefined;
            }
            else{
                userTask.priority = req.validatedData.priority;
            }
        }
        if (req.validatedData.tags !== undefined){
            const tags = await Tag.find({
                _id: {$in: req.validatedData.tags},
                userId: req.userId
            });
            const userTagIds = new Set(tags.map((tag) => tag.id));
            const allTagsBelongToUser = req.validatedData.tags.every(
                tagId => userTagIds.has(tagId)
            );
            if (!allTagsBelongToUser){
                return res.status(400).json({
                    message: "One or more tags are invalid."
                });
            }
            userTask.tags = req.validatedData.tags;
        }
        await userTask.save();
        res.status(200).json({
            "message": "Task updated successfully.",
            task: userTask
        });
    }
    catch (err){
        console.error(err);
        res.status(500).json({
            "message": "Failed to update task."
        });
    }
}

const deleteTaskController = async (req, res) => {
    try{
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid task ID."
            });
        }
        const deleteTask = await Task.findOneAndDelete({
            _id: req.params.id,
            userId: req.userId
        });
        if (!deleteTask){
            return res.status(404).json({
                "message": "Task not found."
            });
        }
        res.status(200).json({
            "message": "Task successfully deleted."
        });
    }
    catch (err){
        console.error(err);
        res.status(500).json({
            "message": "Failed to delete task."
        });
    }
}

module.exports = {createTaskController, getTasksController, getTaskByIdController, updateTaskController, deleteTaskController};

