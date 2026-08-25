const express = require("express");
const router = express.Router();
const {register, login, logout} = require("../controllers/auth.controller");
const {registerValidator, loginValidator} = require('../validators/auth.validator');
const validationMiddleware = require('../middleware/validation.middleware');
const {authLimiter} = require("../middleware/rateLimit.middleware");

router.use(authLimiter);

router.post("/register", registerValidator, validationMiddleware, register);

router.post("/login", loginValidator, validationMiddleware, login);

router.post("/logout", logout);

module.exports = router;    