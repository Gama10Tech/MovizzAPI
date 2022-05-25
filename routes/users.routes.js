const express = require('express');
const authController = require("../controllers/auth.controller");
const userController = require("../controllers/users.controller");

let router = express.Router();

router.route('/')
    .get(authController.verifyToken, userController.findAll)
    .post(userController.create);

router.route('/:id')
    .get(authController.verifyToken, userController.findOne)
    .patch(userController.changeIdFields);

module.exports = router;