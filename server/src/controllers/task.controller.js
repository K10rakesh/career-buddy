const Task = require("../models/Task");

const createTaskController = async (req, res) => {
    try{
        const task = new Task(req.validatedData);
        await task.save();
        res.status(201).json(task);
    }
    catch(err){
        console.error(err);
        res.status(500).json({
            message: "Error creating new task"
        });
    }
}

module.exports = createTaskController;

