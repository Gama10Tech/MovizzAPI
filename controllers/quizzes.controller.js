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
            let data = await Quiz.find({}).populate("theme_id").lean().exec();

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
                let data = await Quiz.findOne({ quiz_id: req.params.quiz_id }).populate("comments.user_id", "avatar first_name last_name _id id").lean().exec();

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

exports.edit = async(req, res) => {
    const userInitiator = await User.findOne({ id: req.loggedUserId }).exec();
    if (userInitiator.is_admin) {
        try {
            const quizData = await Quiz.findOne({ quiz_id: req.params.quiz_id}).exec();
            if (quizData) {
                if (!req.body) {
                    res.status(400).json({ success: false, msg: "The field 'data' cannot be empty or invalid." });
                } else {
                    quizData.type.description = req.body.type.description;
                    quizData.type.questions = req.body.type.questions;
                    quizData.difficulty.description = req.body.difficulty.description;
                    quizData.difficulty.question_points = req.body.difficulty.question_points;
                    quizData.is_specific = req.body.is_specific;
                    quizData.title = req.body.title;
                    quizData.description = req.body.description;
                    quizData.theme_id = req.body.theme_id;
                    quizData.questions = [];
                    req.body.questions.forEach((question, i) => {
                        quizData.questions.push({
                            question_id: i,
                            imdb_id: question.imdb_id,
                            content: question.content,
                            image: question.image,
                            options: []
                        });
                        console.log(question.options);
                        question.options.forEach(option => {
                            quizData.questions[quizData.questions.length - 1].options.push({
                                content: option.content,
                                correct: option.correct
                            });
                        });
                    })

                    if (quizData.poster.toString() != req.body.poster.toString()) {
                        quizData.poster = req.body.poster;
                        quizData.poster_webp = null;
                    }

                    if (quizData.banner.toString() != req.body.banner.toString()) {
                        quizData.banner = req.body.banner;
                        quizData.banner_webp = null;
                    }

                    await quizData.save();
                    await quizData.populate("theme_id").execPopulate();
                    res.status(200).json({ success: true, msg: "The quiz ID " + quizData.quiz_id + " has been edited successfully.", location: "/api/quizzes/" + quizData.quiz_id, data: quizData });
                }
            } else {
                res.status(404).json({ success: false, msg: "The ID specified does not belong to any quiz." });
            }
        } catch (err) {
            res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
        }
    } else {
        res.status(401).json({ success: false, msg: "You are not authorized to make this request." });
    }
}

exports.remove = async(req, res) => {
    try {
        res.status(200).json({ success: true, msg: "Ok"});
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
}

exports.addComment = async(req, res) => {
    try {
        const userInitiator = await User.findOne({ id: req.loggedUserId });
        const quizData = await Quiz.findOne({ quiz_id: req.params.quiz_id }).exec();

        if (!quizData) {
            res.status(404).json({ success: false, msg: "The ID specified does not belong to any quiz." });
        } else if (!req.body.comment && !req.body.comment.toString()) {
            res.status(400).json({ success: false, msg: "The field 'comment' cannot be empty or invalid." });
        } else {
            quizData.comments.push({
                id: quizData.comments.length == 0 ? 0 : Math.max(...quizData.comments.map(comment => comment.id)) + 1,
                user_id: userInitiator._id,
                comment: req.body.comment,
                date: new Date()
            });

            await quizData.save();
            await quizData.populate("comments.user_id", "avatar first_name last_name _id id").execPopulate();
            res.status(201).json({
                success: true,
                msg: "Comment from user ID: " + userInitiator.id + " successfully added to the quiz ID " + quizData.quiz_id,
                location: "/api/quizzes/" + quizData.quiz_id + "/comments/" + quizData.comments[quizData.comments.length - 1].id,
                data: quizData.comments[quizData.comments.length - 1]
            });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
    }
}

exports.removeComment = async(req, res) => {
    try {
        const userInitiator = await User.findOne({ id: req.loggedUserId }).exec(); // This will always be executed successfully
        const quizData = await Quiz.findOne({ quiz_id: req.params.quiz_id }).exec();

        if (!quizData) {
            res.status(404).json({ success: false, msg: "The ID specified does not belong to any quiz." });
        } else {
            const commentIdx = quizData.comments.findIndex(comment => comment.id.toString() == req.params.comment_id.toString());
            if (commentIdx != -1) {
                if ((userInitiator.is_admin) || (userInitiator._id.toString() == quizData.comments[commentIdx].user_id.toString())) {
                    quizData.comments.splice(commentIdx, 1);
                    await quizData.save();
                    res.status(200).json({ success: true, msg: "Comment ID " + req.params.comment_id.toString() + " successfully removed from quiz ID " + quizData.quiz_id.toString() });
                } else {
                    res.status(401).json({ success: false, msg: "You are not authorized to make this request." });
                }
            } else {
                res.status(404).json({ success: false, msg: "The ID specified does not belong to any comment in the quiz requested." });
            }
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
    }
}

exports.calculateRating = async(quiz_id) => {
    let userWithRatings = await User.find({ quiz_ratings: { $exists: true, $not: {$size: 0} } }).lean().exec();
    let i = 0, len1 = userWithRatings.length, sum = 0.0, quant = 0;
    while (i < len1) {
        let j = 0, len2 = userWithRatings[i].quiz_ratings.length;
        while (j < len2) {
            if (userWithRatings[i].quiz_ratings[j].quiz_id.toString() == quiz_id.toString()) {
                quant++;
                sum += userWithRatings[i].quiz_ratings[j].rating;
                break;
            } j++
        } i++;
    }
    return quant > 0 ? sum / quant : 0.0;
}

function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}
