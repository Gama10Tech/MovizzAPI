const express = require('express');
const titleController = require("../controllers/titles.controller");
const authController = require("../controllers/auth.controller");

let router = express.Router();

router.route('/')
    .get(authController.verifyToken, titleController.findAll) // tem várias query strings
    .post(authController.verifyToken, titleController.create);

router.route('/:imdb_id')
    .get(authController.verifyToken, titleController.findOne)
    .delete(authController.verifyToken, titleController.delete);

router.route('/:imdb_id/platforms')
    .patch(authController.verifyToken, titleController.changePlatforms);

router.route('/:imdb_id/comments')
    .delete(authController.verifyToken, titleController.deleteComment)
    .post(authController.verifyToken, titleController.createComment);

module.exports = router;