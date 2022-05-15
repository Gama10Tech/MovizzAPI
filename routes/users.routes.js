const express = require('express');
const userController = require("../controllers/users.controller");

let router = express.Router();

router.route('/')
    .get(userController.findAll)
    .post(userController.create);

router.route('/:id')
    .get(userController.findOne)
    .patch(userController.changeIdFields);

module.exports = router;