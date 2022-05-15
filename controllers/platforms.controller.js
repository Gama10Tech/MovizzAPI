const db = require("../models/index.js");
const Platform = db.platforms;
const User = db.users;

exports.findAll = async (req, res) => {
    try {
        if (await User.findOne({ auth_key: req.body.auth_key })) {
            let data = await Platform.find().exec();
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
        if (await User.findOne({ auth_key: req.body.auth_key })) {
            if (isInt(req.params.platform_id)) {
                const platform = await Platform.findOne({ platform_id: req.params.platform_id }).exec();

                if (platform === null)
                    return res.status(404).json({
                        success: false, msg: "O id especificado não pertence a nenhuma plataforma"
                    });
        
                res.json({ success: true, msg: platform });
            } else {
                res.status(404).json({ success: false, msg: "O campo platform_id não pode estar vazio ou ser inválido" });
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

