const {body} = require('express-validator');

const tagValidator = [
    body('name').exists().isString().trim().notEmpty().isLength({max: 30})
];

module.exports = tagValidator; 