const db = require("../models/index.js");
const Genre = db.genres;
const User = db.users;

exports.findAll = async (req, res) => {
    try {
        if (await User.findOne({ id: req.loggedUserId })) {
            let data = await Genre.find().exec();
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
            if (isInt(req.params.genre_id)) {
                const genre = await Genre.findOne({ genre_id: req.params.genre_id }).exec();
                if (genre === null)
                    return res.status(404).json({
                        success: false, msg: "O id especificado não pertence a nenhum género"
                    });
        
                res.json({ success: true, msg: genre });
            } else {
                res.status(404).json({ success: false, msg: "O campo genre_id não pode estar vazio ou ser inválido" });
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

