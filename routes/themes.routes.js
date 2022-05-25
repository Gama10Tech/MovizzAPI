const express = require('express');
const themeController = require("../controllers/themes.controller");
const authController = require("../controllers/auth.controller");

let router = express.Router();

router.route('/')
    .get(authController.verifyToken, themeController.findAll);

router.route('/:theme_id')
    .get(authController.verifyToken, themeController.findOne);

module.exports = router;