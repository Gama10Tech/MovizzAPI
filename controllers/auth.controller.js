const db = require("../models/index.js");
const User = db.users;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

exports.login = async (req, res) => {
    try {
        if (req.body.email) {
            if (req.body.password) {
                const userData = await User.findOne({ email: req.body.email }).exec();
                if (userData) {
                    if (bcrypt.compareSync(req.body.password, userData.password)) {
                        if (!userData.is_locked) {
                            const token = jwt.sign({ id: userData.id }, db.secret, { expiresIn: '24h' });
                            res.status(200).json({ success: true, auth_key: token, exp_date: new Date(new Date().getTime() + (24 * 60 * 60 * 1000)).toString() });
                        } else {
                            res.status(401).json({
                                success: false, msg: "A conta encontra-se bloqueada, tente novamente mais tarde"
                            });
                        }
                    } else {
                        res.status(401).json({ success: false, msg: "The password entered isn't correct." });
                    }
                } else {
                    res.status(401).json({ success: false, msg: "The email entered wasn't found in our system." });
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

exports.verifyToken = async (req, res, next) => {
    const header = req.headers['x-access-token'] || req.headers.authorization || req.headers.Authorization;
    if (typeof header == 'undefined') {
        res.status(401).json({ success: false, msg: "You are not authorized to make this request, please make sure you are correctly signed in." });
    }
    const token = header.split(' ')[1];
    try {
        let decoded = jwt.verify(token, db.secret);
        req.loggedUserId = decoded.id;
        if (await User.findOne({ id: req.loggedUserId })) {
            next();
        } else {
            res.status(401).json({ success: false, msg: "You are not authorized to make this request, please make sure you are correctly signed in." });
        }
    } catch (err) {
        return res.status(401).json({ success: false, msg: "É necessário estar autenticado para realizar este pedido" });
    }
}
