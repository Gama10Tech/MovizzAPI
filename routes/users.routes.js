const express = require('express');
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/users.controller");

let router = express.Router();

router.route('/')
    .get(authController.verifyToken, userController.findAll)
    .post(userController.create);

router.route('/:id')
    .get(authController.verifyToken, userController.findOne)
    .patch(authController.verifyToken, userController.edit);

router.route('/:id/points')
    .post(authController.verifyToken, userController.addPoints);

router.route('/:id/xp')
    .post(authController.verifyToken, userController.addXP);

router.route('/:id/badges')
    .post(authController.verifyToken, userController.changeBadge);

router.route('/:id/played')
    .post(authController.verifyToken, userController.addQuizAttempt);

router.route('/:id/prizes_reedemed')
    .post(authController.verifyToken, userController.reedemPrize);

router.route('/:id/played/:played_id')
    .patch(authController.verifyToken, userController.updateQuizAttempt);

router.route('/:id/avatar')
    .post(authController.verifyToken, userController.changeAvatar);

router.route('/:id/favourites')
    .post(authController.verifyToken, userController.addFavourite)
    .delete(authController.verifyToken, userController.removeFavourite);

router.route('/:id/seen')
    .post(authController.verifyToken, userController.addSeen)
    .delete(authController.verifyToken, userController.removeSeen);

router.route('/:id/title_ratings/:id_imdb')
    .get(authController.verifyToken, userController.findTitleRating)
    .post(authController.verifyToken, userController.addTitleRating)
    .patch(authController.verifyToken, userController.changeTitleRating)
    .delete(authController.verifyToken, userController.removeTitleRating);

router.route('/:id/quiz_ratings')
    .post(authController.verifyToken, userController.addQuizRating);

router.route('/:id/quiz_ratings/:quiz_id')
    .patch(authController.verifyToken, userController.changeQuizRating)
    .delete(authController.verifyToken, userController.removeQuizRating);

module.exports = router;