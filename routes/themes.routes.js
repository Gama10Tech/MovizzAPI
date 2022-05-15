const express = require('express');
const themeController = require("../controllers/themes.controller");

let router = express.Router();

router.route('/')
    .get(themeController.findAll);

router.route('/:theme_id')
    .get(themeController.findOne);

module.exports = router;