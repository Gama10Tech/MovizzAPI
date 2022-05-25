const express = require('express');
const platformController = require("../controllers/platforms.controller");
const authController = require("../controllers/auth.controller");

let router = express.Router();

router.route('/')
    .get(authController.verifyToken, platformController.findAll);

router.route('/:platform_id')
    .get(authController.verifyToken, platformController.findOne);

module.exports = router;