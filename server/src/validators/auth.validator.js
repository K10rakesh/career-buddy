const {body} = require('express-validator');
const registerValidator = [
    body('name').exists().isString().trim().notEmpty().isLength({max: 50}),
    body('email').exists().trim().notEmpty().isEmail().normalizeEmail(),
    body('password').exists().isString().notEmpty().isLength({min: 8, max: 72})
];
const loginValidator = [
    body('email').exists().trim().notEmpty().isEmail().normalizeEmail(),
    body('password').exists().isString().notEmpty().isLength({min: 8, max: 72})
];
module.exports = {registerValidator, loginValidator};