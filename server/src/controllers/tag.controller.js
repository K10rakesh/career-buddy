const Tag = require("../models/Tag");
const Task = require("../models/Task");
const mongoose = require("mongoose");

const createTagController = async (req, res) => {
    try{
        const tag = new Tag({
            ...req.validatedData,
            userId: req.userId
        });
        await tag.save();
        res.status(201).json({
            message: "Tag created successfully.",
            tag: {
                id: tag.id,
                name: tag.name
            }
        });
    }
    catch(err){
        if (err.code === 11000){
            return res.status(409).json({
                message: "Tag already exists."
            });
        }
        console.error(err);
        res.status(500).json({
            message: "Error creating new tag."
        });
    }
}

const getTagsController = async (req, res) => {
    try{
        const userTags = await Tag.find({userId: req.userId}).sort({name: 1});
        const tags = userTags.map((tag) => ({
            id: tag.id,
            name: tag.name
        }));
        res.status(200).json({
            tags
        });
    }
    catch (err){
        console.error(err);
        return res.status(500).json({
            message: "Failed to retrieve tags."
        });
    }
}

const updateTagController = async (req, res) => {
    try{
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid tag ID."
            });
        }
        const tagId = req.params.id;
        const userId = req.userId;
        const userTag = await Tag.findOne({
            _id: tagId,
            userId: userId
        });
        if (!userTag){
            return res.status(404).json({
                "message": "Tag not found."
            });
        }
        if (req.validatedData.name !== undefined){
            userTag.name = req.validatedData.name;
        }
        await userTag.save();
        res.status(200).json({
            "message": "Tag updated successfully.",
            tag: {
                id: userTag.id,
                name: userTag.name
            }
        });
    }
    catch (err){
        console.error(err);
        if (err.code === 11000){
            return res.status(409).json({
                message: "Tag already exists."
            });
        }
        res.status(500).json({
            "message": "Failed to update tag."
        });
    }
}

const deleteTagController = async (req, res) => {
    try{
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(400).json({
                message: "Invalid tag ID."
            });
        }
        const tag = await Tag.findOne({
            _id: req.params.id,
            userId: req.userId
        });
        if (!tag){
            return res.status(404).json({
                message: "Tag not found."
            });
        }
        await Task.updateMany({
            userId: req.userId,
            tags: req.params.id
        }, 
        {
            $pull: {
                tags: req.params.id
            }
        });
        await tag.deleteOne();
        res.status(200).json({
            "message": "Tag successfully deleted."
        });
    }
    catch (err){
        console.error(err);
        res.status(500).json({
            "message": "Failed to delete tag."
        });
    }
}

module.exports = {createTagController, getTagsController, updateTagController, deleteTagController};