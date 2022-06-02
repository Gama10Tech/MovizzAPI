const db = require("../models/index.js");
const User = db.users;
const Badge = db.badges;
const Title = db.titles;
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
                        .populate("favourites")
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
    req.body = req.body.user;
    try {
        if (!req.body.email) {
            res.status(400).json({success: false, msg: "O campo email tem de estar preenchido"});
        }
        else if (!req.body.first_name) {
            res.status(400).json({success: false, msg: "O campo first_name tem de estar preenchido"});
        }
        else if (!req.body.last_name) {
            res.status(400).json({success: false, msg: "O campo last_name tem de estar preenchido"});
        }
        else if (!req.body.password) {
            res.status(400).json({success: false, msg: "O campo password tem de estar preenchido"});
        }
        else if (!req.body.dob) {
            res.status(400).json({success: false, msg: "O campo dob tem de estar preenchido"});
        }
        else if (await User.findOne({ email: req.body.email })) {
            res.status(422).json({success: false, msg: "O e-mail introduzido já está a ser utilizado"});
        }
        else {
            const highestID = await User.find({}, 'id').sort({ id: -1 }).limit(1).exec();
            const newUser = new User({
                "id": parseInt(highestID[0].id) + 1,
                "first_name": req.body.first_name,
                "last_name": req.body.last_name,
                "dob": req.body.dob,
                "email": req.body.email,
                "password": req.body.password
            });

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

exports.changeBadge = async(req, res) => {
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
                    const newMedal = await Badge.findOne(req.badge_id);
                    if (newMedal) {
                        // Permitir logo se o initiator for administrador
                        if (userInitiator.is_admin) {
                            success(userTarget);
                        } else {
                            // Permitir se o iniator for o próprio alvo
                            if (userTarget.id == userInitiator.id) {
                                success(userTarget);
                            } else {
                                res.status(401).json({success: false, msg: "É necessário ter permissões para realizar este pedido"});
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
        await User.updateOne({_id: a._id}, {'badge_id':req.body.badge_id}).exec();
        res.status(201).json({success: true, msg: "Badge do utilizador #" + a.id + " alterada com sucesso para " + req.body.badge_id, location: "/api/users/" + a.id });
    };
};

exports.changeAvatar = async(req, res) => {
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
                            res.status(401).json({success: false, msg: "É necessário ter permissões para realizar este pedido"});
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
        await User.updateOne({_id: a._id}, {'avatar':req.body.avatar}).exec();
        res.status(201).json({success: true, msg: "Avatar do utilizador #" + a.id + " alterado com sucesso para " + req.body.avatar, location: "/api/users/" + a.id });
    };
};

exports.addFavourite = async(req, res) => {
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
        await User.updateOne({_id: a._id}, {$push: {'favourites':req.body.title}}).exec();
        res.status(201).json({success: true, msg: "Favorito do utilizador #" + a.id + " adicionado com sucesso para " + req.body.title, location: "/api/users/" + a.id });
    };
};

exports.removeFavourite = async(req, res) => {
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
        await User.updateOne({_id: a._id}, {$pull: {'favourites':req.body.title}}).exec();
        res.status(201).json({success: true, msg: "Favorito do utilizador #" + a.id + " removido com sucesso" });
    };
};

exports.addSeen = async(req, res) => {
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
        await User.updateOne({_id: a._id}, {$push: {'seen':req.body.title}}).exec();
        res.status(201).json({success: true, msg: "Visto do utilizador #" + a.id + " adicionado com sucesso para " + req.body.title, location: "/api/users/" + a.id });
    };
};

exports.removeSeen = async(req, res) => {
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
        await User.updateOne({_id: a._id}, {$pull: {'seen':req.body.title}}).exec();
        res.status(201).json({success: true, msg: "Visto do utilizador #" + a.id + " removido com sucesso" });
    };
};

//Fiquei aqui
exports.findRating = async(req, res) => {
    
    try {
        const userInitiator = await User.findOne({ id: req.loggedUserId });
        const userTarget = await User.findOne({ _id: req.params.id });
        // // Verificar se o id do alvo é válido
        if (userTarget) {
            // Verificar se vem algum objeto no body com o nome de avatar
          
                // Verificar se esse objeto tem um campo válido
                let x=await Title.findOne({ imdb_id: req.params.id_imdb })
                    if (x) {
                        if (userTarget.id == userInitiator.id) {

                            let t=await User.findOne({_id: req.params.id}, '_id title_ratings').exec();

                            let result =t.title_ratings.filter(t=>String(t.title_id)==String(x._id))
                             
                            res.status(201).json({success: true, msg: result.length>0 ? result[0].rating : 0});
                        } else {
                            res.status(401).json({success: false, msg: "É necessário ter permissões para realizar este pedido"});
                        }
                    }
                    else{
                        res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum titulo" });
                    }
                
            
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }
};


exports.addRating = async(req, res) => {
    try {
        
        const userInitiator = await User.findOne({ id: req.loggedUserId });
        const userTarget = await User.findOne({ _id: req.params.id });

        //Ver se o id de utilizador enviado existe
        if (userTarget) {
            
            //Validar o body
            if (req.body.title_id && req.body.rating) {
                let t=await Title.findOne({ _id: req.body.title_id })
           
                    if (t) {
                        if (userTarget.id == userInitiator.id) {
                            let j=userTarget.title_ratings.filter(u=>u.title_id==t._id)
                            if (j.length==0) {
                                await User.updateOne({_id: userTarget._id}, {$push: {'title_ratings':req.body}}).exec();
                                res.status(201).json({success: true, msg: "Rating do utilizador #" + userTarget._id + " adicionado com sucesso" });
                            }
                        } else {

                            res.status(401).json({success: false, msg: "É necessário ter permissões para realizar este pedido"});
                        }
                    }
                    else{
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


exports.changeRating = async(req, res) => {
    try {
        
        const userInitiator = await User.findOne({ id: req.loggedUserId });
        const userTarget = await User.findOne({ _id: req.params.id });

        if (userTarget) {
         
            if (req.body.title_id && req.body.rating) {
                
                if (String(req.body.title_id)) {

                    if (await Title.findOne({ _id: req.body.title_id })) {

                        if (userTarget.id == userInitiator.id) {
                            let j=userTarget.title_ratings.filter(u=>u.title_id==req.body.title_id)
                            if (j.length>0) {
                                await User.updateOne({ _id: userTarget._id, "title_ratings.title_id": req.body.title_id }, { $set: { 'title_ratings.$.rating': req.body.rating } }).exec();
                                res.status(201).json({success: true, msg: "Rating do utilizador #" + userTarget._id + " alterado com sucesso" });
                            }
                        } else {

                            res.status(401).json({success: false, msg: "É necessário ter permissões para realizar este pedido"});
                        }
                    }
                    else{
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

exports.removeRating = async(req, res) => {
    try {
        
        const userInitiator = await User.findOne({ id: req.loggedUserId });
        const userTarget = await User.findOne({ _id: req.params.id });

        if (userTarget) {
         
            if (req.body.title_id && req.body.rating==0) {
                
                if (String(req.body.title_id)) {

                    if (await Title.findOne({ _id: req.body.title_id })) {

                        if (userTarget.id == userInitiator.id) {
                            let j=userTarget.title_ratings.filter(u=>u.title_id==req.body.title_id)
                            if (j.length>0) {
                                await User.updateOne({ _id: userTarget._id },{ $pull: { 'title_ratings': { 'title_id': req.body.title_id } } });
                                res.status(201).json({success: true, msg: "Rating do utilizador #" + userTarget._id + " removido com sucesso" });
                            }
                        } else {

                            res.status(401).json({success: false, msg: "É necessário ter permissões para realizar este pedido"});
                        }
                    }
                    else{
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

exports.edit = async(req, res) => {
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
                                            res.status(404).json({ success: false, msg: "O campo is_locked não pode estar vazio ou ser inválido" });
                                        }
                                    } else {
                                        res.status(404).json({ success: false, msg: "O campo is_admin não pode estar vazio ou ser inválido" });
                                    }
                                } else {
                                    res.status(404).json({ success: false, msg: "O campo dob não pode estar vazio ou ser inválido" });
                                }
                            } else {
                                res.status(404).json({ success: false, msg: "O campo password não pode estar vazio ou ser inválido" });
                            }
                        } else {
                            res.status(404).json({ success: false, msg: "O campo email não pode estar vazio ou ser inválido" });
                        }
                    } else {
                        res.status(404).json({ success: false, msg: "O campo last_name não pode estar vazio ou ser inválido" });
                    }
                } else {
                    res.status(404).json({ success: false, msg: "O campo first_name não pode estar vazio ou ser inválido" });
                }
            } else {
                res.status(401).json({success: false, msg: "É necessário ter permissões para realizar este pedido"});
            }
        } else {
            res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum utilizador" });
        }
    } catch (err) {
        res.status(500).json({success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"});
    }

    async function success(a, b, c) {
        await User.updateOne({_id: a._id}, {
            'first_name': b.first_name,
            'last_name': b.last_name,
            'email': b.email,
            'password': b.password == "" ? a.password : b.password,
            'dob': String(b.dob),
            'is_admin': c.is_admin ? b.is_admin : a.is_admin,
            'is_locked': c.is_admin ? b.is_locked : a.is_locked
        }).exec();
        res.status(201).json({success: true, msg: "Utilizador #" + a.id + " atualizado com sucesso", location: "/api/users/" + a.id });
    };
};

function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}
