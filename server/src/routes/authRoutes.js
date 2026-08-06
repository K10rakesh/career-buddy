const express = require("express");
const router = express.Router();
const register = require("../controllers/authController");
const createAuthValidator = require('../validators/auth.validator');
const validationMiddleware = require('../middleware/validation.middleware');

router.post("/register", createAuthValidator, validationMiddleware, register);

module.exports = router; 