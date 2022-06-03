const db = require("../models/index.js");
const User = db.users;
const Title = db.titles;

exports.findAll = async (req, res) => {
    try {
        if (req.query.top10 != undefined && req.query.top10 != 'undefined' && req.query.top10 != null) { 
            if ((req.query.top10 == true || req.query.top10 == 'true') && (req.query.movie == "true" || req.query.movie == true ) ) {
                let data = await Title.find({ seasons: 0 }, 'imdb_id poster poster_webp title imdb_rating genre_id year country seasons')
                .sort({ imdb_rating: -1 })
                .limit(10)
                .exec();
                res.status(200).json({success: true, msg: data});
            } 
            else if ((req.query.top10 == true || req.query.top10 == 'true') && (req.query.movie == "false" || req.query.movie == false )){
                let data = await Title.find({ seasons: { $ne: 0 } }, 'imdb_id poster poster_webp title imdb_rating genre_id year country seasons')
                .sort({ imdb_rating: -1 })
                .limit(10)
                .exec();
                res.status(200).json({success: true, msg: data});
            }
            else {
                success();
            }
        } else {
            success();
        }
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }

    async function success() {
        if (await User.findOne({ id: req.loggedUserId })) {
            let data = await Title.find({}, 'imdb_id poster poster_webp title imdb_rating genre_id year country seasons').lean().exec();
            for (let k = 0; k < data.length; k++) {
                let ratings = await User.find({ "title_ratings.title_id": { $eq: data[k]._id } }).exec();
                let sum = 0.0;
                let total = 0;

                if (ratings.length > 0) {
                    for (let i = 0; i < ratings.length; i++) {
                        for (let j = 0; j < ratings[i].title_ratings.length; j++) {
                            if (String(ratings[i].title_ratings[j].title_id) == String(data[k]._id)) {
                                sum += parseInt(ratings[i].title_ratings[j].rating);
                                total += 1;
                                break;
                            }
                        }
                    }
                    data[k].movizz_rating = sum / total;
                } else {
                    data[k].movizz_rating = 0.0;
                }
            }
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
                    let result = await Title.findOne({ imdb_id: req.params.imdb_id })
                    .populate("comments.user_id", "avatar first_name last_name _id id")
                    .populate("platforms.platform_id")
                    .populate("genres.genre_id")
                    .exec();
                    result = result.toJSON();

                    // Determinar o rating Movizz do título
                    let ratings = await User.find({ "title_ratings.title_id": { $eq: result._id } }).lean().exec();
                    let sum = 0.0;
                    let total = 0;
                    if (ratings.length > 0) {
                        for (let i = 0; i < ratings.length; i++) {
                            for (let j = 0; j < ratings[i].title_ratings.length; j++) {
                                if (String(ratings[i].title_ratings[j].title_id) == String(result._id)) {
                                    sum += parseInt(ratings[i].title_ratings[j].rating);
                                    total += 1;
                                }
                            }
                        }
                        ratings = sum / total;
                    } else {
                        ratings = 0.0;
                    }

                    result.movizz_rating = ratings;
                    res.status(200).json({success: true, msg: result });
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
        console.log(err);
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
        if (String(req.body._id)) {
            if (await Title.findOne({ _id: req.body._id_title })) {
                    await Title.updateOne({_id: req.body._id_title}, { $pull: { comments: { _id:  req.body._id_comment} } }).exec();
                    res.status(201).json({success: true, msg: "Comentário do utilizador #" + req.body._id_comment + " removido com sucesso" });
            }
            else{
                res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum titulo" });
            }
        } else {
            res.status(404).json({ success: false, msg: "O campo _id não pode estar vazio ou ser inválido" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }
};

exports.createComment=async(req,res)=>{
    try {
        if (req.body.title_id && req.body.user_id && req.body.comment && String(req.body.spoiler)) {
            let x=await Title.findOne({ _id: req.body.title_id })
            if (x) {
                const location = x.comments.length==0 ? 0 : Math.max(...x.comments.map(a => a.id))+1
                let t= await Title.findOneAndUpdate({_id: req.body.title_id}, {$push: {comments: {
                    id: location,
                    user_id:req.body.user_id,
                    comment:req.body.comment,
                    date:new Date(),
                    spoiler: req.body.spoiler
                }}}, {useFindAndModify: false}).exec();
                res.status(201).json({success: true, msg: "Comment do utilizador #" + req.body.user_id + " adicionado com sucesso ", location: location});
            }
            else{
                res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum titulo" });
            }
        } else {
            res.status(404).json({ success: false, msg: "Os campos não podem estar vazios ou ser inválidos" });
        }
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }
};

function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}
