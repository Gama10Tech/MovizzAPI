const express = require('express');
const platformController = require("../controllers/platforms.controller");

let router = express.Router();

router.route('/')
    .get(platformController.findAll);

router.route('/:platform_id')
    .get(platformController.findOne);

module.exports = router;