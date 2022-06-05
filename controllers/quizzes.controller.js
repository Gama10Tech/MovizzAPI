const db = require("../models/index.js");
const User = db.users;
const Quiz = db.quizzes;

exports.findAll = async (req, res) => {
    try {
        if (req.query.top10 != undefined && req.query.top10 != 'undefined' && req.query.top10 != null) { 
            if (req.query.top10 == true || req.query.top10 == 'true') {
                success(true);
            } else {
                success();
            }
        } else {
            success();
        }
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }

    async function success(top) {
        if (await User.findOne({ id: req.loggedUserId })) {
            let data = await Quiz.find({}, 'quiz_id title theme_id poster poster_webp difficulty type theme_id times_played').populate("theme_id").lean().exec();

            let userWithRatings = await User.find({ quiz_ratings: { $exists: true, $not: {$size: 0} } }).lean().exec();
            let k = 0, len = data.length;
            while (k < len) {
                let i = 0, len1 = userWithRatings.length, sum = 0.0, quant = 0;
                while (i < len1) {
                    let j = 0, len2 = userWithRatings[i].quiz_ratings.length;
                    while (j < len2) {
                        if (userWithRatings[i].quiz_ratings[j].quiz_id.toString() == data[k]._id.toString()) {
                            quant++;
                            sum += userWithRatings[i].quiz_ratings[j].rating;
                            userWithRatings[i].quiz_ratings.splice(j, 1);
                            break;
                        } j++
                    } i++;
                }
                data[k].quizz_rating = quant > 0 ? sum / quant : 0.0;
                k++;
            }

            res.status(200).json({success: true, msg: top ? data.sort((a, b) => a.quizz_rating < b.quizz_rating && 1 || -1).slice(0, 11) : data});
        } else {
            res.status(401).json({ success: false, msg: "É necessário estar autenticado para realizar este pedido" });
        }
    };
};

exports.findOne = async (req, res) => {
    try {
        if (await User.findOne({ id: req.loggedUserId })) {
            if (isInt(req.params.quiz_id)) {
                let data = await Quiz.findOne({ quiz_id: req.params.quiz_id }).lean().exec();

                let userWithRatings = await User.find({ quiz_ratings: { $exists: true, $not: {$size: 0} } }).lean().exec();
                let i = 0, len1 = userWithRatings.length, sum = 0.0, quant = 0;
                while (i < len1) {
                    let j = 0, len2 = userWithRatings[i].quiz_ratings.length;
                    while (j < len2) {
                        if (userWithRatings[i].quiz_ratings[j].quiz_id.toString() == data._id.toString()) {
                            quant++;
                            sum += userWithRatings[i].quiz_ratings[j].rating;
                            break;
                        } j++
                    } i++;
                }
                data.quizz_rating = quant > 0 ? sum / quant : 0.0;

                if (data) {
                    res.status(200).json({ success: true, msg: data });
                } else {
                    res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum quiz" });
                }
            } else {
                res.status(404).json({ success: false, msg: "O campo quiz_id não pode estar vazio ou ser inválido" });
            }
        } else {
            res.status(401).json({ success: false, msg: "É necessário estar autenticado para realizar este pedido"});
        }
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
};

exports.create = async(req, res) => {
    try {
        res.status(200).json({ success: true, msg: "Ok"});
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
}

exports.alterQuizById = async(req, res) => {
    try {
        res.status(200).json({ success: true, msg: "Ok"});
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
}

exports.removeQuizById = async(req, res) => {
    try {
        res.status(200).json({ success: true, msg: "Ok"});
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
}

function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}
