const express = require('express');
const badgeController = require("../controllers/badges.controller");
const authController = require("../controllers/auth.controller");

let router = express.Router();

router.route('/')
    .get(authController.verifyToken, badgeController.findAll)

router.route('/:badge_id')
    .get(authController.verifyToken, badgeController.findOne)

module.exports = router;