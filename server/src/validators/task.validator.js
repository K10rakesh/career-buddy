const {body} = require('express-validator');
const allowedFields = require('./helpers/allowedFields');

const createTaskValidator = [
    body('title').exists().isString().trim().notEmpty().isLength({max: 50}),
    body('description').optional().isString().trim().isLength({max: 200}),
    allowedFields(['title', 'description'])
];

const updateTaskValidator = [
    body('title').optional().isString().trim().notEmpty().isLength({max: 50}),
    body('description').optional().isString().trim().isLength({max: 200}),
    body('completed').optional().isBoolean({strict: true}),
    allowedFields(["title", "description", "completed"]),
    body().custom((value) => {
        if (Object.keys(value).length === 0){
            throw new Error("At least one field is required.");
        }
        return true;
    })
];

module.exports = {createTaskValidator, updateTaskValidator}; 