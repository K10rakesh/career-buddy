const express = require("express");
const router = express.Router();
const {register, login} = require("../controllers/auth.controller");
const {registerValidator, loginValidator} = require('../validators/auth.validator');
const validationMiddleware = require('../middleware/validation.middleware');
const authMiddleware = require("../middleware/auth.middleware");

router.post("/register", registerValidator, validationMiddleware, register);

router.post("/login", loginValidator, validationMiddleware, login);

module.exports = router;    