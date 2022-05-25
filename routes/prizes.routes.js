const express = require('express');
const prizeController = require("../controllers/prizes.controller");
const authController = require("../controllers/auth.controller");

let router = express.Router();

router.route('/')
    .get(authController.verifyToken, prizeController.findAll)
    .post(authController.verifyToken, prizeController.create);

router.route('/:prize_id')
    .get(authController.verifyToken, prizeController.findOne)
    .patch(authController.verifyToken, prizeController.changePrizeById)
    .delete(authController.verifyToken, prizeController.removePrizeById);

module.exports = router;