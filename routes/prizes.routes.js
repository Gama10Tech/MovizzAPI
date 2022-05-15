const express = require('express');
const prizeController = require("../controllers/prizes.controller");

let router = express.Router();

router.route('/')
    .get(prizeController.findAll)
    .post(prizeController.create);

router.route('/:prize_id')
    .get(prizeController.findOne)
    .patch(prizeController.changePrizeById)
    .delete(prizeController.removePrizeById);

module.exports = router;