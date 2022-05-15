const express = require('express');
const badgeController = require("../controllers/badges.controller");

let router = express.Router();

router.route('/')
    .get(badgeController.findAll)

router.route('/:badge_id')
    .get(badgeController.findOne)

module.exports = router;