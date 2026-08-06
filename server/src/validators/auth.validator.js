const {body} = require('express-validator');
const allowedFields = require('./helpers/allowedFields');
const createAuthValidator = [
    body('name').exists().isString().trim().notEmpty(),
    body('email').exists().trim().notEmpty().isEmail().normalizeEmail(),
    body('password').exists().notEmpty().isLength({min: 8, max: 72}),
    allowedFields(['name', 'email', 'password'])
];
module.exports = createAuthValidator;