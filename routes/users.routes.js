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

router.route('/:id/badges')
    .post(authController.verifyToken, userController.changeBadge);

router.route('/:id/avatar')
    .post(authController.verifyToken, userController.changeAvatar);

module.exports = router;