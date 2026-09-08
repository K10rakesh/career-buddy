const express = require("express");
const router = express.Router();
const {register, login, logout, getCurrentUser} = require("../controllers/auth.controller");
const {registerValidator, loginValidator} = require('../validators/auth.validator');
const validationMiddleware = require('../middleware/validation.middleware');
const {authLimiter} = require("../middleware/rateLimit.middleware");
const authMiddleware = require("../middleware/auth.middleware");
const allowedFields = require("../middleware/allowedFields.middleware");

router.use(authLimiter);

router.post("/register", allowedFields(['name', 'email', 'password']), registerValidator, validationMiddleware, register);

router.post("/login", allowedFields(['email', 'password']), loginValidator, validationMiddleware, login);

router.post("/logout", logout);

router.get("/me", authMiddleware, getCurrentUser);

module.exports = router;    