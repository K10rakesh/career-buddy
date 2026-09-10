const {body} = require('express-validator');

const createTaskValidator = [
    body('title').exists().isString().trim().notEmpty().isLength({max: 50}),
    body('description').optional().isString().trim().isLength({max: 200}),
    body('deadline').optional({nullable: true}).isISO8601().toDate()
];

const updateTaskValidator = [
    body('title').optional().isString().trim().notEmpty().isLength({max: 50}),
    body('description').optional().isString().trim().isLength({max: 200}),
    body('completed').optional().isBoolean({strict: true}),
    body('deadline').optional({nullable: true}).isISO8601().toDate()
];

module.exports = {createTaskValidator, updateTaskValidator}; 