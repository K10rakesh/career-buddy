const express = require("express");
const router = express.Router();
const {createTagController, getTagsController, updateTagController, deleteTagController} = require("../controllers/tag.controller");
const tagValidator = require('../validators/tag.validator');
const validationMiddleware = require('../middleware/validation.middleware');
const authMiddleware = require("../middleware/auth.middleware");
const {apiLimiter} = require("../middleware/rateLimit.middleware");
const allowedFields = require("../middleware/allowedFields.middleware");
const requireAtleastOneField = require("../middleware/requireAtleastOneField.middleware")

router.use(apiLimiter);

router.use(authMiddleware);

router.post("/", requireAtleastOneField, allowedFields(["name"]), tagValidator, validationMiddleware, createTagController);

router.get("/", getTagsController);

router.patch("/:id", requireAtleastOneField, allowedFields(["name"]), tagValidator, validationMiddleware, updateTagController);

router.delete("/:id", deleteTagController);

module.exports = router; 