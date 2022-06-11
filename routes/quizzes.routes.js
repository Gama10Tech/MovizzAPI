const express = require('express');
const quizController = require("../controllers/quizzes.controller");
const authController = require("../controllers/auth.controller");

let router = express.Router();

router.route('/')
    .get(authController.verifyToken, quizController.findAll)
    .post(authController.verifyToken, quizController.create);

 router.route('/:quiz_id')
    .get(authController.verifyToken, quizController.findOne)
    .patch(authController.verifyToken, quizController.edit)
    .delete(authController.verifyToken, quizController.remove);

router.route('/:quiz_id/comments')
    .post(authController.verifyToken, quizController.addComment);

router.route('/:quiz_id/comments/:comment_id')
    .delete(authController.verifyToken, quizController.removeComment);

module.exports = router;