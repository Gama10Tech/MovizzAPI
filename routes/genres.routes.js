const express = require('express');
const genreController = require("../controllers/genres.controller");

let router = express.Router();

router.route('/')
    .get(genreController.findAll);

router.route('/:genre_id')
    .get(genreController.findOne);

module.exports = router;