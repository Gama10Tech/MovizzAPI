const db = require("../models/index.js");
const User = db.users;
const Title = db.titles;

exports.findAll = async (req, res) => {
    try {
        if (req.query.top10 != undefined && req.query.top10 != 'undefined' && req.query.top10 != null) { 
            if ((req.query.top10 == true || req.query.top10 == 'true') && (req.query.movie == "true" || req.query.movie == true ) ) {
                let data = await Title.find({seasons:0}, 'imdb_id poster poster_webp title imdb_rating genre_id year country seasons').limit(10).exec();
                res.status(200).json({success: true, msg: data});
            } 
            else if((req.query.top10 == true || req.query.top10 == 'true') && (req.query.movie == "false" || req.query.movie == false )){
                let data = await Title.find({seasons:{$ne:0}}, 'imdb_id poster poster_webp title imdb_rating genre_id year country seasons').limit(10).exec();
                res.status(200).json({success: true, msg: data});
            }
            else {
                success();
            }
        }
        else {
            success();
        }
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }

    async function success() {
        if (await User.findOne({ id: req.loggedUserId })) {
            let data = await Title.find({}, 'imdb_id poster poster_webp title imdb_rating genre_id year country seasons').exec();
            res.status(200).json({success: true, msg: data});
        } else {
            res.status(401).json({
                success: false, msg: "É necessário estar autenticado para realizar este pedido"
            });
        }
    };
};

exports.findOne = async (req, res) => {
    try {
        if (await User.findOne({ id: req.loggedUserId })) {
            if (String(req.params.imdb_id).match(/ev\d{7}\/\d{4}(-\d)?|(ch|co|ev|nm|tt)\d{7}/)) {
                if (await Title.findOne({ imdb_id: req.params.imdb_id })) {
                    res.status(200).json({success: true, msg: await Title.findOne({ imdb_id: req.params.imdb_id }).populate("comments.user_id").exec()});
                } else {
                    res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum título" });
                }
            } else {
                res.status(404).json({ success: false, msg: "O campo imdb_id não pode estar vazio ou ser inválido" });
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

exports.create=async(req,res)=>{
    try {
        res.status(200).json({ success: true, msg: "Ok"});
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
};

exports.deleteByImdbId=async(req,res)=>{
    try {
        res.status(200).json({ success: true, msg: "Ok"});
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
};

exports.deleteComment = async(req, res) => {
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
                            res.status(401).json({success: false, msg: "É necessário ter permissões para realizar este pedido"});
                        }
                    }
                    else{
                        res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum titulo" });
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
        await User.updateOne({_id: a._id}, {$pull: {'comments':req.body.title}}).exec();
        res.status(201).json({success: true, msg: "Comentário do utilizador #" + a.id + " removido com sucesso" });
    };
};