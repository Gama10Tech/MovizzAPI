const db = require("../models/index.js");
const calculateRating = require("../controllers/quizzes.controller").calculateRating;
const User = db.users;
const Badge = db.badges;
const Title = db.titles;
const Quiz = db.quizzes;
const Prize = db.prizes;
const bcrypt = require("bcryptjs");

exports.findAll = async (req, res) => {
    try {
        if (req.query.top5 && (req.query.top5 == true || req.query.top5 == 'true')) {
            let data = await User.find({}, 'id first_name last_name avatar badge_id xp stats.level')
                .populate("badge_id")
                .sort({ xp: -1 })
                .limit(5)
                .exec();
            res.status(200).json({ success: true, msg: data });
        } else {
            let data = await User.find({}, 'id first_name last_name avatar register_date is_locked badge_id xp stats.level')
                .populate("badge_id")
                .exec();
            res.status(200).json({ success: true, msg: data });
        }
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
};

exports.findOne = async (req, res) => {
    try {
        const userInitiator = await User.findOne({ id: req.loggedUserId });
        if (isInt(req.params.id)) {
            const userData = await User.findOne({ id: req.params.id });
            if (userData) {
                // Se o utilizador for administrador ou o id que está a tentar a ser acedido for o mesmo do auth_key mostrar a informação completa
                if (userInitiator["is_admin"] || userData["id"] == userInitiator["id"]) {
                    let t = await User.find({ id: req.params.id }, '-password')
                    .populate("played.quiz_id", "-questions -comments")
                    .populate("badge_id")
                    .populate([{ path: "favourites", model: "title", select: "imdb_id poster poster_webp _id title genres year country imdb_rating", populate: { path: 'genres.genre_id',select: "description", model: 'genre' } }])
                    .populate([{ path: "seen", model: "title", select: "-platforms", populate: { path: 'genres.genre_id',select: "description", model: 'genre' } }])
                    .populate("title_ratings.title_id", "poster_webp poster title seasons imdb_id")
                    .populate("quiz_ratings.quiz_id", "poster_webp poster title quiz_id")
                    .populate("prizes_reedemed.prize_id")
                    .lean()
                    .exec();

                    let titleComments = await Title.find({ 'comments.user_id':  t[0]._id }).exec();
                    let quizComments = await Quiz.find({ 'comments.user_id': t[0]._id }).exec(); 

                    t[0].all_comments = [];

                    titleComments.forEach(title => {
                        title.comments.forEach(comment => {
                            if (comment.user_id.toString() == t[0]._id.toString()) {
                                t[0].all_comments.push({
                                    comment_data: comment,
                                    imdb_id: title.imdb_id,
                                    _id: title._id,
                                    title:title.title,
                                    seasons:title.seasons
                                });
                            }
                        });
                    });

                    quizComments.forEach(quiz => {
                        quiz.comments.forEach(comment => {
                            if (comment.user_id.toString() == t[0]._id.toString()) {
                                t[0].all_comments.push({
                                    comment_data: comment,
                                    quiz_id: quiz.quiz_id,
                                    _id: quiz._id,
                                    title:quiz.title,
                                });
                            }
                        });
                    });

                    // Mostrar a informação toda
                    res.status(200).json({ success: true, msg: t });
                } else {
                    // Mostrar apenas parte da informação
                    const result =  await User.find({ id: req.params.id }, 'id first_name last_name avatar register_date badge_id xp seen favourites stats')
                    .populate("badge_id")
                    .populate([{ path: "favourites", model: "title", select: "imdb_id poster poster_webp _id title genres year country imdb_rating", populate: { path: 'genres.genre_id',select: "description", model: 'genre' } }])
                    .populate([{ path: "seen", model: "title", select: "-platforms", populate: { path: 'genres.genre_id',select: "description", model: 'genre' } }])
                    .lean()
                    .exec();
                    res.status(200).json({ success: true, msg: result });
                }
            } else {
                res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
            }
        } else {
            res.status(404).json({ success: false, msg: "O campo id não pode estar vazio ou ser inválido" });
        }
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
};

exports.create = async (req, res) => {
    req.body = req.body.user;
    try {
        if (!req.body.email) {
            res.status(400).json({ success: false, msg: "O campo email tem de estar preenchido" });
        }
        else if (!req.body.first_name) {
            res.status(400).json({ success: false, msg: "O campo first_name tem de estar preenchido" });
        }
        else if (!req.body.last_name) {
            res.status(400).json({ success: false, msg: "O campo last_name tem de estar preenchido" });
        }
        else if (!req.body.password) {
            res.status(400).json({ success: false, msg: "O campo password tem de estar preenchido" });
        }
        else if (!req.body.dob) {
            res.status(400).json({ success: false, msg: "O campo dob tem de estar preenchido" });
        }
        else if (await User.findOne({ email: req.body.email })) {
            res.status(422).json({ success: false, msg: "O e-mail introduzido já está a ser utilizado" });
        }
        else {
            const highestID = await User.find({}, 'id').sort({ id: -1 }).limit(1).exec();
            const newUser = new User({
                "id": parseInt(highestID[0].id) + 1,
                "first_name": req.body.first_name,
                "last_name": req.body.last_name,
                "dob": req.body.dob,
                "email": req.body.email,
                "password": bcrypt.hashSync(req.body.password, 10)
            });

            await newUser.save();
            res.status(201).json({ success: true, msg: "Utilizador registado com sucesso" });
        }
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
};

exports.changeBadge = async (req, res) => {
    try {
        const userInitiator = await User.findOne({ id: req.loggedUserId });
        const userTarget = await User.findOne({ id: req.params.id });

        // Verificar se o id do alvo é válido
        if (userTarget) {
            // Verificar se vem algum objeto no body com o nome de badge_id
            if (req.body.badge_id) {
                // Verificar se esse objeto tem um campo válido
                if (String(req.body.badge_id)) {
                    // Verificar se esse id pertence às medalhas
                    const newMedal = await Badge.findOne({ badge_id:req.body.badge_id });
                    if (newMedal) {
                        // Permitir logo se o initiator for administrador
                        if (userInitiator.is_admin) {
                            success(userTarget);
                        } else {
                            // Permitir se o iniator for o próprio alvo
                            if (userTarget.id == userInitiator.id) {
                                success(userTarget);
                            } else {
                                res.status(401).json({ success: false, msg: "É necessário ter permissões para realizar este pedido" });
                            }
                        }
                    } else {
                        res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhuma medalha" });
                    }
                } else {
                    res.status(404).json({ success: false, msg: "O campo badge_id não pode estar vazio ou ser inválido" });
                }
            } else {
                res.status(404).json({ success: false, msg: "O campo badge_id não pode estar vazio ou ser inválido" });
            }
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }

    async function success(a) {
        await User.updateOne({ _id: a._id }, { 'badge_id': req.body.badge_id }).exec();
        res.status(201).json({ success: true, msg: "Badge do utilizador #" + a.id + " alterada com sucesso para " + req.body.badge_id, location: "/api/users/" + a.id });
    };
};

exports.changeAvatar = async (req, res) => {
    try {
        const userInitiator = await User.findOne({ id: req.loggedUserId });
        const userTarget = await User.findOne({ id: req.params.id });

        // Verificar se o id do alvo é válido
        if (userTarget) {
            // Verificar se vem algum objeto no body com o nome de avatar
            if (req.body.avatar) {
                // Verificar se esse objeto tem um campo válido
                if (String(req.body.avatar)) {
                    // Permitir logo se o initiator for administrador
                    if (userInitiator.is_admin) {
                        success(userTarget);
                    } else {
                        // Permitir se o iniator for o próprio alvo
                        if (userTarget.id == userInitiator.id) {
                            success(userTarget);
                        } else {
                            res.status(401).json({ success: false, msg: "É necessário ter permissões para realizar este pedido" });
                        }
                    }
                } else {
                    res.status(404).json({ success: false, msg: "O campo avatar não pode estar vazio ou ser inválido" });
                }
            } else {
                res.status(404).json({ success: false, msg: "O campo avatar não pode estar vazio ou ser inválido" });
            }
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }

    async function success(a) {
        await User.updateOne({ _id: a._id }, { 'avatar': req.body.avatar }).exec();
        res.status(201).json({ success: true, msg: "Avatar do utilizador #" + a.id + " alterado com sucesso para " + req.body.avatar, location: "/api/users/" + a.id });
    };
};

exports.addFavourite = async (req, res) => {
    try {
        const userInitiator = await User.findOne({ id: req.loggedUserId });
        const userTarget = await User.findOne({ id: req.params.id });

        // Verificar se o id do alvo é válido
        if (userTarget) {
            // Verificar se vem algum objeto no body com o nome de avatar
            if (req.body.title) {
                // Verificar se esse objeto tem um campo válido
                if (String(req.body.title)) {
                    if (await Title.findOne({ _id: req.body.title })) {
                        if (userTarget.id == userInitiator.id) {
                            success(userTarget);
                        } else {
                            res.status(401).json({ success: false, msg: "É necessário ter permissões para realizar este pedido" });
                        }
                    }
                    else {
                        res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum titulo" });
                    }
                } else {
                    res.status(404).json({ success: false, msg: "O campo title não pode estar vazio ou ser inválido" });
                }
            } else {
                res.status(404).json({ success: false, msg: "O campo title não pode estar vazio ou ser inválido" });
            }
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }

    async function success(a) {
        await User.updateOne({ _id: a._id }, { $push: { 'favourites': req.body.title } }).exec();
        res.status(201).json({ success: true, msg: "Favorito do utilizador #" + a.id + " adicionado com sucesso para " + req.body.title, location: "/api/users/" + a.id });
    };
};

exports.removeFavourite = async (req, res) => {
    try {
        const userInitiator = await User.findOne({ id: req.loggedUserId });
        const userTarget = await User.findOne({ id: req.params.id });

        // Verificar se o id do alvo é válido
        if (userTarget) {
            // Verificar se vem algum objeto no body com o nome de avatar
            if (req.body.title) {
                // Verificar se esse objeto tem um campo válido
                if (String(req.body.title)) {
                    if (await Title.findOne({ _id: req.body.title })) {
                        if (userTarget.id == userInitiator.id) {
                            success(userTarget);
                        } else {
                            res.status(401).json({ success: false, msg: "É necessário ter permissões para realizar este pedido" });
                        }
                    }
                    else {
                        res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum titulo" });
                    }
                } else {
                    res.status(404).json({ success: false, msg: "O campo title não pode estar vazio ou ser inválido" });
                }
            } else {
                res.status(404).json({ success: false, msg: "O campo title não pode estar vazio ou ser inválido" });
            }
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }

    async function success(a) {
        await User.updateOne({ _id: a._id }, { $pull: { 'favourites': req.body.title } }).exec();
        res.status(201).json({ success: true, msg: "Favorito do utilizador #" + a.id + " removido com sucesso" });
    };
};

exports.addSeen = async (req, res) => {
    try {
        const userInitiator = await User.findOne({ id: req.loggedUserId });
        const userTarget = await User.findOne({ id: req.params.id });

        // Verificar se o id do alvo é válido
        if (userTarget) {
            // Verificar se vem algum objeto no body com o nome de avatar
            if (req.body.title) {
                // Verificar se esse objeto tem um campo válido
                if (String(req.body.title)) {
                    if (await Title.findOne({ _id: req.body.title })) {
                        if (userTarget.id == userInitiator.id) {
                            success(userTarget);
                        } else {
                            res.status(401).json({ success: false, msg: "É necessário ter permissões para realizar este pedido" });
                        }
                    } else {
                        res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum titulo" });
                    }
                } else {
                    res.status(404).json({ success: false, msg: "O campo title não pode estar vazio ou ser inválido" });
                }
            } else {
                res.status(404).json({ success: false, msg: "O campo title não pode estar vazio ou ser inválido" });
            }
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }

    async function success(a) {
        await User.updateOne({ _id: a._id }, { $push: { 'seen': req.body.title } }).exec();
        res.status(201).json({ success: true, msg: "Visto do utilizador #" + a.id + " adicionado com sucesso para " + req.body.title, location: "/api/users/" + a.id });
    };
};

exports.removeSeen = async (req, res) => {
    try {
        const userInitiator = await User.findOne({ id: req.loggedUserId });
        const userTarget = await User.findOne({ id: req.params.id });
        // Verificar se o id do alvo é válido
        if (userTarget) {
            // Verificar se vem algum objeto no body com o nome de avatar
            if (req.body.title) {
                // Verificar se esse objeto tem um campo válido
                if (String(req.body.title)) {
                    if (await Title.findOne({ _id: req.body.title })) {
                        if (userTarget.id == userInitiator.id) {
                            success(userTarget);
                        } else {
                            res.status(401).json({ success: false, msg: "É necessário ter permissões para realizar este pedido" });
                        }
                    }
                    else {
                        res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum titulo" });
                    }
                } else {
                    res.status(404).json({ success: false, msg: "O campo title não pode estar vazio ou ser inválido" });
                }
            } else {
                res.status(404).json({ success: false, msg: "O campo title não pode estar vazio ou ser inválido" });
            }
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }

    async function success(a) {
        await User.updateOne({ _id: a._id }, { $pull: { 'seen': req.body.title } }).exec();
        res.status(201).json({ success: true, msg: "Visto do utilizador #" + a.id + " removido com sucesso" });
    };
};

exports.findTitleRating = async (req, res) => {
    try {
        const userInitiator = await User.findOne({ id: req.loggedUserId });
        const userTarget = await User.findOne({ _id: req.params.id });
        // Verificar se o id do alvo é válido
        if (userTarget) {
            // Verificar se esse objeto tem um campo válido
            let x = await Title.findOne({ imdb_id: req.params.id_imdb })
            if (x) {
                if (userTarget.id == userInitiator.id) {

                    let t = await User.findOne({ _id: req.params.id }, '_id title_ratings').exec();

                    let result = t.title_ratings.filter(t => String(t.title_id) == String(x._id))

                    res.status(201).json({ success: true, msg: result.length > 0 ? result[0].rating : 0 });
                } else {
                    res.status(401).json({ success: false, msg: "É necessário ter permissões para realizar este pedido" });
                }
            }
            else {
                res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum titulo" });
            }
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }
};

exports.addTitleRating = async (req, res) => {
    try {

        const userInitiator = await User.findOne({ id: req.loggedUserId });
        const userTarget = await User.findOne({ _id: req.params.id });

        //Ver se o id de utilizador enviado existe
        if (userTarget) {

            //Validar o body
            if (req.body.title_id && req.body.rating) {
                let t = await Title.findOne({ _id: req.body.title_id })

                if (t) {
                    if (userTarget.id == userInitiator.id) {
                        let j = userTarget.title_ratings.filter(u => u.title_id == t._id)
                        if (j.length == 0) {
                            userTarget.title_ratings.push(req.body);
                            await userTarget.save();
                            await userTarget.populate("title_ratings.title_id", "poster poster_webp seasons imdb_id title _id").execPopulate();
                            res.status(201).json({ success: true, msg: "Rating do utilizador #" + userTarget._id + " adicionado com sucesso", data: userTarget });
                        }
                    } else {

                        res.status(401).json({ success: false, msg: "É necessário ter permissões para realizar este pedido" });
                    }
                }
                else {
                    res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum titulo" });
                }
            } else {
                res.status(404).json({ success: false, msg: "O campo title_id e rating não pode estar vazio ou ser inválido" });
            }
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }
};

exports.changeTitleRating = async (req, res) => {
    try {

        const userInitiator = await User.findOne({ id: req.loggedUserId });
        const userTarget = await User.findOne({ _id: req.params.id });

        if (userTarget) {
            if (req.body.title_id && req.body.rating) {
                if (String(req.body.title_id)) {

                    if (await Title.findOne({ _id: req.body.title_id })) {

                        if (userTarget.id == userInitiator.id) {
                            let j = userTarget.title_ratings.filter(u => u.title_id == req.body.title_id)
                            if (j.length > 0) {
                                const ratingIdx = userTarget.title_ratings.findIndex(tt => tt.title_id.toString() == req.body.title_id.toString());
                                userTarget.title_ratings[ratingIdx].rating = req.body.rating;
                                await userTarget.save();
                                await userTarget.populate("title_ratings.title_id", "poster poster_webp seasons imdb_id title _id").execPopulate();
                                res.status(201).json({ success: true, msg: "Rating do utilizador #" + userTarget._id + " alterado com sucesso", data: userTarget });
                            }
                        } else {

                            res.status(401).json({ success: false, msg: "É necessário ter permissões para realizar este pedido" });
                        }
                    }
                    else {
                        res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum titulo" });
                    }
                } else {
                    res.status(404).json({ success: false, msg: "O campo title_id não pode estar vazio ou ser inválido" });
                }
            } else {
                res.status(404).json({ success: false, msg: "O campo title_id e rating não pode estar vazio ou ser inválido" });
            }
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }
};

exports.removeTitleRating = async (req, res) => {
    try {
        const userInitiator = await User.findOne({ id: req.loggedUserId });
        const userTarget = await User.findOne({ _id: req.params.id });

        if (userTarget) {
            if (req.body.title_id && req.body.rating == 0) {
                if (String(req.body.title_id)) {
                    if (await Title.findOne({ _id: req.body.title_id })) {
                        if (userTarget.id == userInitiator.id) {
                            let j = userTarget.title_ratings.filter(u => u.title_id == req.body.title_id)
                            if (j.length > 0) {
                                userTarget.title_ratings = userTarget.title_ratings.filter(u => u.title_id.toString() != req.body.title_id.toString());
                                await userTarget.save();
                                await userTarget.populate("title_ratings.title_id", "poster poster_webp seasons imdb_id title _id").execPopulate();
                                res.status(201).json({ success: true, msg: "Rating do utilizador #" + userTarget._id + " removido com sucesso", data: userTarget });
                            }
                        } else {
                            res.status(401).json({ success: false, msg: "É necessário ter permissões para realizar este pedido" });
                        }
                    } else {
                        res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum titulo" });
                    }
                } else {
                    res.status(404).json({ success: false, msg: "O campo title_id não pode estar vazio ou ser inválido" });
                }
            } else {
                res.status(404).json({ success: false, msg: "O campo title_id e rating não pode estar vazio ou ser inválido" });
            }
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }
};

exports.addQuizRating = async (req, res) => {
    try {
        const userInitiator = await User.findOne({ id: req.loggedUserId }); // This will always be available
        const userTarget = await User.findOne({ id: req.params.id });

        if (userTarget) {
            if (!req.body.quiz_id || !req.body.quiz_id.toString()) {
                res.status(400).json({ success: false, msg: "The field 'quiz_id' cannot be empty or invalid." });
            } else if (!req.body.rating || !req.body.rating.toString()) {
                res.status(400).json({ success: false, msg: "The field 'rating' cannot be empty or invalid." });
            } else if (!isInt(req.body.rating)) {
                res.status(400).json({ success: false, msg: "The field 'rating' cannot be empty or invalid." });
            } else {
                const quizData = await Quiz.findOne({ quiz_id: req.body.quiz_id }).exec();
                if (quizData) {
                    if (userInitiator.id.toString() == userTarget.id.toString()) {
                        userTarget.quiz_ratings.push({
                            quiz_id: quizData._id,
                            rating: parseInt(req.body.rating)
                        });
                        await userTarget.save();
                        await userTarget.populate("quiz_ratings.quiz_id", "poster poster_webp quiz_id title _id").execPopulate();
                        const newAverage = await calculateRating(quizData._id);
                        res.status(201).json({
                            success: true,
                            msg: "Rating for the quiz ID " + quizData.quiz_id + " added successfully.",
                            location: "/api/users/" + userTarget.id + "/quiz_ratings/" + userTarget.quiz_ratings[userTarget.quiz_ratings.length - 1]._id,
                            data: userTarget.quiz_ratings[userTarget.quiz_ratings.length - 1],
                            average: newAverage
                        });
                    } else {
                        res.status(401).json({ success: false, msg: "You are not authorized to make this request." });
                    }
                } else {
                    res.status(404).json({ success: false, msg: "The ID specified does not belong to any quiz." });
                }
            }
        } else {
            res.status(404).json({ success: false, msg: "The ID specified does not belong to any user." });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
    }
};

exports.changeQuizRating = async (req, res) => {
    try {
        const userInitiator = await User.findOne({ id: req.loggedUserId }); // This will always be available
        const userTarget = await User.findOne({ id: req.params.id });

        if (userTarget) {
            if (!req.body.rating.toString()) {
                res.status(400).json({ success: false, msg: "The field 'rating' cannot be empty or invalid." });
            } else if (!isInt(req.body.rating)) {
                res.status(400).json({ success: false, msg: "The field 'rating' cannot be empty or invalid." });
            } else {
                const quizData = await Quiz.findOne({ quiz_id: req.params.quiz_id }).exec();
                if (quizData) {
                    if (userInitiator.id.toString() == userTarget.id.toString()) {
                        const ratingIdx = userTarget.quiz_ratings.findIndex(rating => rating.quiz_id.toString() == quizData._id.toString());
                        if (ratingIdx != -1) {
                            userTarget.quiz_ratings[ratingIdx].rating = parseInt(req.body.rating);
                            await userTarget.save();
                            await userTarget.populate("quiz_ratings.quiz_id", "poster poster_webp quiz_id title _id").execPopulate();
                            const newAverage = await calculateRating(quizData._id);
                            res.status(200).json({
                                success: true,
                                msg: "Rating for the quiz ID " + quizData.quiz_id + " updated successfully.",
                                location: "/api/users/" + userTarget.id + "/quiz_ratings/" + userTarget.quiz_ratings[ratingIdx]._id,
                                average: newAverage
                            });
                        } else {
                            res.status(404).json({ success: false, msg: "No rating for that quiz was found." });
                        }
                    } else {
                        res.status(401).json({ success: false, msg: "You are not authorized to make this request." });
                    }
                } else {
                    res.status(404).json({ success: false, msg: "The ID specified does not belong to any quiz." });
                }
            }
        } else {
            res.status(404).json({ success: false, msg: "The ID specified does not belong to any user." });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
    }
};

exports.removeQuizRating = async (req, res) => {
    try {
        const userInitiator = await User.findOne({ id: req.loggedUserId }); // This will always be available
        const userTarget = await User.findOne({ id: req.params.id });

        if (userTarget) {
            const quizData = await Quiz.findOne({ quiz_id: req.params.quiz_id }).exec();
            if (quizData) {
                if (userInitiator.id.toString() == userTarget.id.toString()) {
                    const ratingIdx = userTarget.quiz_ratings.findIndex(rating => rating.quiz_id.toString() == quizData._id.toString());
                    if (ratingIdx != -1) {
                        userTarget.quiz_ratings.splice(ratingIdx, 1);
                        await userTarget.save();
                        const newAverage = await calculateRating(quizData._id);
                        res.status(200).json({
                            success: true,
                            msg: "Rating for the quiz ID " + quizData.quiz_id + " removed successfully.",
                            average: newAverage
                        });
                    } else {
                        res.status(404).json({ success: false, msg: "No rating for that quiz was found." });
                    }
                } else {
                    res.status(401).json({ success: false, msg: "You are not authorized to make this request." });
                }
            } else {
                res.status(404).json({ success: false, msg: "The ID specified does not belong to any quiz." });
            }
        } else {
            res.status(404).json({ success: false, msg: "The ID specified does not belong to any user." });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
    }
};

exports.edit = async (req, res) => {
    try {
        const userInitiator = await User.findOne({ id: req.loggedUserId });
        const userTarget = await User.findOne({ id: req.params.id });

        if (userTarget) {
            // O utilizador tem de ser administrador ou o próprio para executar este pedido
            if ((userInitiator.is_admin) || (userInitiator.id === userTarget.id)) {
                if (req.body.first_name) {
                    if (req.body.last_name) {
                        if (req.body.email) {
                            if (req.body.password || req.body.password == "") {
                                if (req.body.dob) {
                                    if (req.body.is_admin != null && req.body.is_admin != undefined) {
                                        if (req.body.is_locked != null && req.body.is_locked != undefined) {
                                            // Verificar se o email a editar já está a ser utilizado (caso seja o próprio a atualizar)
                                            const userByEmail = await User.findOne({ email: req.body.email });
                                            if (userByEmail) {
                                                if (userInitiator.is_admin) {
                                                    if (userTarget.id == userByEmail.id) {
                                                        success(userTarget, req.body, userInitiator);
                                                    } else {
                                                        res.status(422).json({ success: false, msg: "O e-mail introduzido já está a ser utilizado" });
                                                    }
                                                } else {
                                                    if (userTarget.id == userInitiator.id) {
                                                        if (userTarget.id == userByEmail.id) {
                                                            success(userTarget, req.body, userInitiator);
                                                        } else {
                                                            res.status(422).json({ success: false, msg: "O e-mail introduzido já está a ser utilizado" });
                                                        }
                                                    } else {
                                                        res.status(422).json({ success: false, msg: "O e-mail introduzido já está a ser utilizado" });
                                                    }
                                                }
                                            } else {
                                                success(userTarget, req.body, userInitiator);
                                            }
                                        } else {
                                            res.status(400).json({ success: false, msg: "O campo is_locked não pode estar vazio ou ser inválido" });
                                        }
                                    } else {
                                        res.status(400).json({ success: false, msg: "O campo is_admin não pode estar vazio ou ser inválido" });
                                    }
                                } else {
                                    res.status(400).json({ success: false, msg: "O campo dob não pode estar vazio ou ser inválido" });
                                }
                            } else {
                                res.status(400).json({ success: false, msg: "O campo password não pode estar vazio ou ser inválido" });
                            }
                        } else {
                            res.status(400).json({ success: false, msg: "O campo email não pode estar vazio ou ser inválido" });
                        }
                    } else {
                        res.status(400).json({ success: false, msg: "O campo last_name não pode estar vazio ou ser inválido" });
                    }
                } else {
                    res.status(400).json({ success: false, msg: "O campo first_name não pode estar vazio ou ser inválido" });
                }
            } else {
                res.status(401).json({ success: false, msg: "É necessário ter permissões para realizar este pedido" });
            }
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }

    async function success(a, b, c) {
        await User.updateOne({ _id: a._id }, {
            'first_name': b.first_name,
            'last_name': b.last_name,
            'email': b.email,
            'password': b.password == "" ? a.password : bcrypt.hashSync(b.password, 10),
            'dob': String(b.dob),
            'is_admin': c.is_admin ? b.is_admin : a.is_admin,
            'is_locked': c.is_admin ? b.is_locked : a.is_locked
        }).exec();
        res.status(201).json({ success: true, msg: "Utilizador #" + a.id + " atualizado com sucesso", location: "/api/users/" + a.id });
    };
};

exports.addQuizAttempt = async (req, res) => {
    const userInitiator = await User.findOne({ id: req.loggedUserId });
    const userTarget = await User.findOne({ id: req.params.id });
    
    try {
        if (userTarget) {
            if (!req.body.quiz_id || !req.body.quiz_id.toString()) {
                res.status(404).json({ success: false, msg: "O campo quiz_id não pode estar vazio ou ser inválido" });
            } else if (!req.body.questions_right || !req.body.questions_right.toString()) {
                res.status(400).json({ success: false, msg: "O campo questions_right não pode estar vazio ou ser inválido" });
            } else if (!req.body.questions_wrong || !req.body.questions_wrong.toString()) {
                res.status(400).json({ success: false, msg: "O campo questions_wrong tem de estar preenchido" });
            } else if (req.body.allowed_points.toString() == "undefined" || req.body.allowed_points.toString() == "null") {
                res.status(400).json({ success: false, msg: "O campo allowed_points tem de estar preenchido" });
            } else if (req.body.was_completed.toString() == "undefined" || req.body.was_completed.toString() == "null") {
                res.status(400).json({ success: false, msg: "O campo was_completed tem de estar preenchido" });
            } else {
                const quizData = await Quiz.findOne({ _id: req.body.quiz_id });
                if (quizData) {
                    if (userTarget._id.toString() == userInitiator._id.toString()) {
                        userTarget.played.push({
                            quiz_id: req.body.quiz_id,
                            date: new Date(),
                            questions_right: req.body.questions_right,
                            questions_wrong: req.body.questions_wrong,
                            allowed_points: req.body.allowed_points,
                            was_completed: req.body.was_completed
                        });

                        quizData.times_played = quizData.times_played + 1;
                        await quizData.save();

                        await userTarget.save();
                        await userTarget.populate("played.quiz_id", "-questions -comments").execPopulate();

                        res.status(201).json({ success: true, msg: "Tentativa de quiz registada com sucesso", location: "/api/users/" + userTarget.id + "/played/" + userTarget.played[userTarget.played.length - 1]._id, data: userTarget.played[userTarget.played.length - 1] });
                    } else {
                        res.status(401).json({ success: false, msg: "Não tem permissões para realizar este pedido" });
                    }
                } else {
                    res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum quiz" });
                }
            }
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }
};

exports.updateQuizAttempt = async (req, res) => {
    const userInitiator = await User.findOne({ id: req.loggedUserId });
    const userTarget = await User.findOne({ id: req.params.id });
    
    try {
        if (userTarget) {
            if (!req.body.questions_right.toString()) {
                res.status(400).json({ success: false, msg: "O campo questions_right não pode estar vazio ou ser inválido" });
            } else if (!req.body.questions_wrong.toString()) {
                res.status(400).json({ success: false, msg: "O campo questions_wrong tem de estar preenchido" });
            } else if (req.body.allowed_points.toString() == "undefined" || req.body.allowed_points.toString() == "null") {
                res.status(400).json({ success: false, msg: "O campo allowed_points tem de estar preenchido" });
            } else if (req.body.was_completed.toString() == "undefined" || req.body.was_completed.toString() == "null") {
                res.status(400).json({ success: false, msg: "O campo was_completed tem de estar preenchido" });
            } else {
                if (userTarget._id.toString() == userInitiator._id.toString()) {
                    const gameIdx = userTarget.played.findIndex(game => game._id.toString() == req.params.played_id.toString())
                    if (gameIdx != -1) {
                        userTarget.played[gameIdx].questions_right = req.body.questions_right;
                        userTarget.played[gameIdx].questions_wrong = req.body.questions_wrong;
                        userTarget.played[gameIdx].allowed_points = req.body.allowed_points;
                        userTarget.played[gameIdx].was_completed = req.body.was_completed;
                        userTarget.played[gameIdx].date = new Date();

                        if (req.body.was_completed.toString() == "true") {
                            userTarget.stats.quizzes_completed = userTarget.stats.quizzes_completed + 1;
                        }
                        userTarget.stats.questions_right = userTarget.stats.questions_right + req.body.questions_right;
                        userTarget.stats.questions_wrong = userTarget.stats.questions_wrong + req.body.questions_wrong;

                        await userTarget.save();
                        await userTarget.populate("played.quiz_id", "-questions -comments").execPopulate();
                        res.status(201).json({ success: true, msg: "Tentativa de quiz atualizada com sucesso", location: "/api/users/" + userTarget.id + "/played/" + userTarget.played[gameIdx]._id, data: userTarget.played[gameIdx] });
                    } else {
                        res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum jogo jogado" });
                    }
                } else {
                    res.status(401).json({ success: false, msg: "Não tem permissões para realizar este pedido" });
                }
            }
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }
};

exports.addPoints = async (req, res) => {
    const userTarget = await User.findOne({ id: req.params.id });
    try {
        if (userTarget) {
            if (req.body.points && req.body.points.toString()) {
                if (isInt(req.body.points)) {
                    userTarget.points = userTarget.points + req.body.points;
                    await userTarget.save();
                    res.status(201).json({ success: true, msg: "Pontos do utilizador #" + userTarget.id + " atualizado com sucesso", location: "/api/users/" + userTarget.id });
                } else {
                    res.status(400).json({ success: false, msg: "O campo points não pode estar vazio ou ser inválido" });
                }
            } else {
                res.status(400).json({ success: false, msg: "O campo points não pode estar vazio ou ser inválido" });
            }
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }
};

exports.addXP = async (req, res) => {
    const userTarget = await User.findOne({ id: req.params.id });
    try {
        if (userTarget) {
            if (req.body.xp && req.body.xp.toString()) {
                if (isInt(req.body.xp)) {
                    let didUserLevelUp = false;
                    userTarget.xp = userTarget.xp + req.body.xp;
                    
                    if (Math.floor(userTarget.xp / 150) != parseInt(userTarget.stats.level)) {
                        didUserLevelUp = true;
                        userTarget.stats.level = userTarget.stats.level + 1;
                    }

                    await userTarget.save();
                    res.status(201).json({ success: true, msg: "XP do utilizador #" + userTarget.id + " atualizado com sucesso", location: "/api/users/" + userTarget.id, passed_level: didUserLevelUp });
                } else {
                    res.status(400).json({ success: false, msg: "O campo xp não pode estar vazio ou ser inválido" });
                }
            } else {
                res.status(400).json({ success: false, msg: "O campo xp não pode estar vazio ou ser inválido" });
            }
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }
};

exports.reedemPrize = async (req, res) => {
    const userTarget = await User.findOne({ id: req.params.id });
    try {
        if (req.body.prize_id && req.body.prize_id.toString()) {
            const prize = await Prize.findOne({ _id: req.body.prize_id.toString() }).exec();
            if (prize === null) {
                return res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum prémio" });
            } else {
                if (userTarget.points - prize.price >= 0) {
                    userTarget.points = userTarget.points - prize.price;
                    userTarget.prizes_reedemed.push({
                        prize_id: req.body.prize_id,
                        date: new Date()
                    });
                    await userTarget.save();
                    await userTarget.populate("prizes_reedemed.prize_id").execPopulate();
                    res.status(201).json({success: true, msg: "Prémio do utilizador #" +  userTarget.id + " redimido com sucesso ", data: userTarget.prizes_reedemed[userTarget.prizes_reedemed.length - 1] });
                } else {
                    res.status(406).json({ success: false, msg: "O utilizador não possui fundos insuficientes" });
                }
            }
        } else {
            res.status(400).json({ success: false, msg: "O campo prize_id não pode estar vazio ou ser inválido" });
        }       
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }
};

exports.changeBlockState = async (req, res) => {
    const userTarget = await User.findOne({ id: req.params.id }).exec();
    const userInitiator = await User.findOne({ id: req.loggedUserId }).exec();

    try {
        if (userInitiator.is_admin) {
            if (userTarget) {
                userTarget.is_locked = !userTarget.is_locked;
                await userTarget.save()
                res.status(200).json({success: true, msg: "The user ID " + userTarget.id + " has been successfully " + (userTarget.is_locked ? "blocked." : "unblocked.") });
            } else {
                res.status(404).json({ success: false, msg: "The ID specified does not belong to any user." });
            }
        } else {
            res.status(401).json({ success: false, msg: "You are not authorized to make this request." });
        }       
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
    }
};

function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}
