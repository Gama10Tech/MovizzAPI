const db = require("../models/index.js");
const User = db.users;

exports.login = async (req, res) => {
    try {
        if (req.body.email) {
            if (req.body.password) {
                const userData = await User.findOne({ $and: [ { email: req.body.email }, { password: req.body.password  } ] })
                if (userData) {
                    res.status(200).json({ success: true, auth_key: userData["auth_key"] });
                } else {
                    res.status(401).json({
                        success: false, msg: "A informação enviada não corresponde a nenhum utilizador"
                    });
                }
            } else {
                res.status(400).json({
                    success: false, msg: "O campo password não pode estar vazio"
                });
            }
        } else {
            res.status(400).json({
                success: false, msg: "O campo email não pode estar vazio"
            });
        }
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
};
