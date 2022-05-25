const db = require("../models/index.js");
const User = db.users;
const Quiz = db.quizzes;

exports.findAll = async (req, res) => {
    try {
        if (await User.findOne({ id: req.loggedUserId })) {
            let data = await Quiz.find({}, 'quiz_id title theme_id poster poster_webp difficulty type').exec();
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
        if (await User.findOne({ id: req.loggedUserId })) {
            if (isInt(req.params.quiz_id)) {
                const data = await Quiz.findOne({ quiz_id: req.params.quiz_id });
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

exports.create=async(req,res)=>{
    try {
        res.status(200).json({ success: true, msg: "Ok"});
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
}

exports.alterQuizById=async(req,res)=>{
    try {
        res.status(200).json({ success: true, msg: "Ok"});
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
}

exports.removeQuizById=async(req,res)=>{
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
