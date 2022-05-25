const db = require("../models/index.js");
const Prize = db.prizes;
const User = db.users;

exports.findAll = async (req, res) => {
    try {
        if (await User.findOne({ id: req.loggedUserId })) {
            let data = await Prize.find().exec();
            res.status(200).json({ success: true, msg: data });
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
            if (isInt(req.params.prize_id)) {
                const prize = await Prize.findOne({ prize_id: req.params.prize_id }).exec();
                if (prize === null)
                    return res.status(404).json({
                        success: false, msg: "O id especificado não pertence a nenhum prémio"
                    });
        
                res.json({ success: true, msg: prize });
            } else {
                res.status(404).json({ success: false, msg: "O campo prize_id não pode estar vazio ou ser inválido" });
            }
        } else {
            res.status(401).json({
                success: false, msg: "É necessário estar autenticado para realizar este pedido"
            });
        }
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
};

exports.changePrizeById=async(req,res)=>{
    try {
        res.status(200).json({ success: true, msg: "Ok"});
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
}

exports.removePrizeById=async(req,res)=>{
    try {
        res.status(200).json({ success: true, msg: "Ok"});
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
}

exports.create=async(req,res)=>{
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

