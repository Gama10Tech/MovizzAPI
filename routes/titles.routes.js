const express = require('express');
const titleController = require("../controllers/titles.controller");

let router = express.Router();

router.route('/')
    .get(titleController.findAll)
    .post(titleController.create);

router.route('/:imdb_id')
    .get(titleController.findOne)
    .delete(titleController.deleteByImdbId);

module.exports = router;