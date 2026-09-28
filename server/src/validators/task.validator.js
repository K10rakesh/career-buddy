const {body} = require('express-validator');

const createTaskValidator = [
    body('title').exists().isString().trim().notEmpty().isLength({max: 50}),
    body('description').optional().isString().trim().isLength({max: 200}),
    body('deadline').optional({nullable: true}).isISO8601().toDate(),
    body('priority').optional().isIn(["High", "Medium", "Low"]),
    body('tags.*').isMongoId()
];

const updateTaskValidator = [
    body('title').optional().isString().trim().notEmpty().isLength({max: 50}),
    body('description').optional().isString().trim().isLength({max: 200}),
    body('completed').optional().isBoolean({strict: true}),
    body('deadline').optional({nullable: true}).isISO8601().toDate(),
    body('priority').optional({nullable: true}).custom((value) => {
        if (!value){
            return true;
        }
        return ["High", "Medium", "Low"].includes(value);
    }),
    body('tags').optional().isArray().custom((tags) => {
        if (new Set(tags).size !== tags.length){
            throw new Error("Tags must be unique.");
        }
        return true;
    }),
    body('tags.*').isMongoId()
];

module.exports = {createTaskValidator, updateTaskValidator}; 