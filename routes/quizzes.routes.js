const express = require('express');
const quizController = require("../controllers/quizzes.controller");

let router = express.Router();

router.route('/')
    .get(quizController.findAll)
    .post(quizController.create);

 router.route('/:quiz_id')
    .get(quizController.findOne)
    .patch(quizController.alterQuizById)
    .delete(quizController.removeQuizById);

module.exports = router;