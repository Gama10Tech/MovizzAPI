const db = require("../models/index.js");
const Theme = db.themes;
const User = db.users;

exports.findAll = async (req, res) => {
    try {
        if (await User.findOne({ id: req.loggedUserId })) {
            let data = await Theme.find().exec();
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
            if (isInt(req.params.theme_id)) {
                const theme = await Theme.findOne({ theme_id: req.params.theme_id }).exec();
                if (theme === null)
                    return res.status(404).json({
                        success: false, msg: "O id especificado não pertence a nenhum tema"
                    });
        
                res.json({ success: true, msg: theme });
            } else {
                res.status(404).json({ success: false, msg: "O campo theme_id não pode estar vazio ou ser inválido" });
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

function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}

