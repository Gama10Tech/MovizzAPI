const db = require("../models/index.js");
const User = db.users;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.findAll = async (req, res) => {
    try {
        if (await User.findOne({ id: req.loggedUserId })) {
            let data = await User.find({}, 'id first_name last_name avatar register_date is_locked badge_id xp stats.level')
            .populate("badge_id")
            .exec();
            res.status(200).json({success: true, msg: data});
        } else {
            res.status(401).json({
                success: false, msg: "É necessário estar autenticado para realizar este pedido"
            });
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
        if (userInitiator) {
            if (isInt(req.params.id)) {
                const userData = await User.findOne({ id: req.params.id });
                if (userData) {
                    // Se o utilizador for administrador ou o id que está a tentar a ser acedido for o mesmo do auth_key mostrar a informação completa
                    if (userInitiator["is_admin"] || userData["id"] == userInitiator["id"]) {
                        let t=await User.find({ id: req.params.id }, 'id register_date first_name last_name email dob avatar badge_id points xp is_admin is_locked play_history comments title_ratings quiz_ratings seen favourites prizes_reedemed stats')
                        .populate("played")
                        .populate("badge_id")
                        .populate("favourites", "imdb_id")
                        .populate("seen", "-platforms")
                        .exec();
                        // Mostrar a informação toda
                        res.status(200).json({success: true, msg: t});
                    } else {
                        // Mostrar apenas parte da informação
                        res.status(200).json({success: true, msg: await User.find({ id: req.params.id }, 'id first_name last_name avatar register_date badge_id xp seen favorites stats')});
                    }
                } else {
                    res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
                }
            } else {
                res.status(404).json({ success: false, msg: "O campo id não pode estar vazio ou ser inválido" });
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

exports.create = async (req, res) => {
    const newUser = new User(req.body);

    try {
        if (!newUser.email) {
            res.status(400).json({success: false, msg: "O campo email tem de estar preenchido"});
        }
        else if (!newUser.first_name) {
            res.status(400).json({success: false, msg: "O campo first_name tem de estar preenchido"});
        }
        else if (!newUser.last_name) {
            res.status(400).json({success: false, msg: "O campo last_name tem de estar preenchido"});
        }
        else if (!newUser.password) {
            res.status(400).json({success: false, msg: "O campo password tem de estar preenchido"});
        }
        else if (!newUser.dob) {
            res.status(400).json({success: false, msg: "O campo dob tem de estar preenchido"});
        }
        else if (await User.findOne({ email: newUser.email })) {
            res.status(422).json({success: false, msg: "O e-mail introduzido já está a ser utilizado"});
        }
        else {
            await newUser.save();
            res.status(201).json({ success: true, msg: "Utilizador registado com sucesso"});
        }
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
};

exports.changeIdFields=async(req,res)=>{
    try {
        res.status(200).json({ success: true, msg: "Ok"});
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
};

function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}
