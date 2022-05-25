const express = require('express');
const genreController = require("../controllers/genres.controller");
const authController = require("../controllers/auth.controller");

let router = express.Router();

router.route('/')
    .get(authController.verifyToken, genreController.findAll);

router.route('/:genre_id')
    .get(authController.verifyToken, genreController.findOne);

module.exports = router;