const db = require("../models/index.js");
const User = db.users;
const Title = db.titles;
const Quiz = db.quizzes;

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
            if (req.query.navbar != undefined && (req.query.navbar == true || req.query.navbar == 'true')) {
                let data = await Title.find({}, 'imdb_id poster poster_webp title seasons').exec();
                res.status(200).json({success: true, msg: data});
            } else {
                let data = await Title.find({}, 'imdb_id poster poster_webp title imdb_rating genres year country seasons platforms').populate("genres.genre_id").populate("platforms.platform_id").lean().exec();
                let userWithRatings = await User.find({ title_ratings: { $exists: true, $not: {$size: 0} } }).lean().exec();
                let userWithSeen = await User.find({ seen: { $exists: true, $not: {$size: 0} } }).lean().exec();

                let k = 0, len = data.length;
                while (k < len) {
                    let i = 0, len1 = userWithRatings.length, sum = 0.0, quant = 0, times_seen = 0;
                    while (i < len1) {
                        let j = 0, len2 = userWithRatings[i].title_ratings.length;
                        while (j < len2) {
                            if (userWithRatings[i].title_ratings[j].title_id.toString() == data[k]._id.toString()) {
                                quant++;
                                sum += userWithRatings[i].title_ratings[j].rating;
                                userWithRatings[i].title_ratings.splice(j, 1);
                                break;
                            } j++
                        } i++;
                    } i = 0, len1 = userWithSeen.length;
                    while (i < len1) {
                        let j = 0, len2 = userWithSeen[i].seen.length;
                        while (j < len2) {
                            if (userWithSeen[i].seen[j].toString() == data[k]._id.toString()) {
                                times_seen++;
                                userWithSeen[i].seen.splice(j, 1);
                                break;
                            } j++
                        } i++;
                    }
                    data[k].movizz_rating = quant > 0 ? sum / quant : 0.0;
                    data[k].times_seen = times_seen;
                    k++;
                } res.status(200).json({success: true, msg: data});
            }
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
                                    break;
                                }
                            }
                        }
                        ratings = sum / total;
                    } else {
                        ratings = 0.0;
                    }
                    result.movizz_rating = ratings;
                    // Determinar se há algum quiz que contém este título
                    result.relatedQuizzes = await Quiz.find({ "questions.imdb_id": { $eq: result.imdb_id } }, "_id quiz_id title description banner banner_webp").exec();

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
        res.status(500).json({
            success: false, msg: err.message || "Algo falhou, por favor tente mais tarde"
        });
    }
};

exports.create = async(req, res) => {
    const userInitiator = await User.findOne({ id: req.loggedUserId }); // This will always be available
    
    if (userInitiator.is_admin) {
        req.body = req.body.title;
        try {
            if (!req.body.imdb_id || !req.body.imdb_id.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'imdb_id' cannot be empty or invalid." });
            }
            else if (!req.body.title || !req.body.title.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'title' cannot be empty or invalid." });
            }
            else if (!req.body.synopsis || !req.body.synopsis.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'synopsis' cannot be empty or invalid." });
            }
            else if (!req.body.poster || !req.body.poster.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'poster' cannot be empty or invalid." });
            }
            else if (!req.body.banner || !req.body.banner.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'banner' cannot be empty or invalid." });
            }
            else if (!req.body.trailer || !req.body.trailer.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'trailer' cannot be empty or invalid." });
            }
            else if (!req.body.year || !req.body.year.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'year' cannot be empty or invalid." });
            }
            else if (!req.body.country || !req.body.country.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'country' cannot be empty or invalid." });
            }
            else if (!req.body.language || !req.body.language.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'language' cannot be empty or invalid." });
            }
            else if (!req.body.content_rating || !req.body.content_rating.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'content_rating' cannot be empty or invalid." });
            }
            else if (req.body.duration.toString().trim() == "undefined" || req.body.duration.toString().trim() == "null") {
                res.status(400).json({ success: false, msg: "The field 'duration' cannot be empty or invalid." });
            }
            else if (req.body.seasons.toString().trim() == "undefined" || req.body.seasons.toString().trim() == "null") {
                res.status(400).json({ success: false, msg: "The field 'seasons' cannot be empty or invalid." });
            }
            else if (!req.body.platforms || !req.body.platforms.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'platforms' cannot be empty or invalid." });
            }
            else if (!req.body.genres || !req.body.genres.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'genres' cannot be empty or invalid." });
            }
            else if (!req.body.cast || !req.body.cast.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'cast' cannot be empty or invalid." });
            }
            else if (!req.body.producers || !req.body.producers.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'producers' cannot be empty or invalid." });
            }
            else if (!req.body.directors || !req.body.directors.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'directors' cannot be empty or invalid." });
            }
            else if (!req.body.writers || !req.body.writers.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'writers' cannot be empty or invalid." });
            }
            else if (req.body.imdb_rating.toString().trim() == "undefined" || req.body.imdb_rating.toString().trim() == "null") {
                res.status(400).json({ success: false, msg: "The field 'imdb_rating' cannot be empty or invalid." });
            }
            else if (await Title.findOne({ imdb_id: req.body.imdb_id.toString().trim() })) {
                res.status(422).json({ success: false, msg: "The IMDb ID specified is already present in the database." });
            }
            else {
                const newTitle = new Title({
                    imdb_id: req.body.imdb_id,
                    title: req.body.title,
                    synopsis: req.body.synopsis,
                    poster: req.body.poster,
                    banner: req.body.banner,
                    trailer: req.body.trailer,
                    year: req.body.year,
                    country: req.body.country,
                    language: req.body.language,
                    content_rating: req.body.content_rating,
                    duration: req.body.duration,
                    seasons: req.body.seasons,
                    platforms: req.body.platforms,
                    genres: req.body.genres,
                    episodes: req.body.episodes ? req.body.episodes : [],
                    cast: req.body.cast,
                    producers: req.body.producers,
                    directors: req.body.directors,
                    writers: req.body.writers,
                    imdb_rating: req.body.imdb_rating,
                    comments: []
                });

                await newTitle.save();
                res.status(201).json({ success: true, msg: "The title has been added to the database successfully.", location: "/api/titles/" + newTitle.imdb_id , data: newTitle });
            }
        }
        catch (err) {
            res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
        }
    } else {
        res.status(401).json({ success: false, msg: "You are not authorized to make this request." });
    }
};

exports.delete = async(req, res) => {
    const userInitiator = await User.findOne({ id: req.loggedUserId })
    .populate("played.quiz_id", "-questions -comments")
    .populate("badge_id")
    .populate([{ path: "favourites", model: "title", select: "imdb_id poster poster_webp _id title genres", populate: { path: 'genres.genre_id', model: 'genre' } }])
    .populate("seen", "-platforms")
    .exec();
    
    if (userInitiator.is_admin) {
        try {
            const titleData = await Title.findOne({ imdb_id: req.params.imdb_id.toString().trim()}).exec();
            
            if (titleData) {
                const allUsers = await User.find({}, "title_ratings seen favourites").exec();

                allUsers.forEach(async user => {
                    user.favourites = user.favourites.filter(fav => fav.toString() != titleData._id.toString());
                    user.seen = user.seen.filter(seen => seen.toString() != titleData._id.toString());
                    user.title_ratings = user.title_ratings.filter(rat => rat.title_id.toString() != titleData._id.toString());
                    await user.save();
                });

                await titleData.remove();
                res.status(200).json({ success: true, msg: "The title has been removed successfully." });
            } else {
                res.status(404).json({ success: false, msg: "The ID specified does not belong to any title." });
            }
        } catch (err) {
            res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
        }
    } else {
        res.status(401).json({ success: false, msg: "You are not authorized to make this request." });
    }
};

exports.changePlatforms = async(req, res) => {
    const userInitiator = await User.findOne({ id: req.loggedUserId }).exec();
    if (userInitiator.is_admin) {
        try {
            if (!req.body.platforms || !req.body.platforms.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'platforms' cannot be empty or invalid." });
            } else {
                const titleData = await Title.findOne({ imdb_id: req.params.imdb_id.toString().trim()}).exec();
            
                if (titleData) {
                    titleData.platforms = req.body.platforms;
                    await titleData.save();
                    await titleData.populate("platforms.platform_id").execPopulate();
                    res.status(200).json({ success: true, msg: "Successfully updated platforms for title ID " + titleData.imdb_id + ".", location: "/api/titles/" + titleData.imdb_id, data: titleData });
                } else {
                    res.status(404).json({ success: false, msg: "The ID specified does not belong to any title." });
                }
            }
        } catch (err) {
            res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
        }
    } else {
        res.status(401).json({ success: false, msg: "You are not authorized to make this request." });
    }
};

exports.deleteComment = async(req, res) => {
    try {
        
            if (await Title.findOne({ _id: req.body._id_title })) {
                    await Title.updateOne({_id: req.body._id_title}, { $pull: { comments: { _id:  req.body._id_comment} } }).exec();
                    res.status(200).json({success: true, msg: "Comentário do utilizador #" + req.body._id_comment + " removido com sucesso" });
            }
            else{
                res.status(404).json({ success: false, msg: "O id especificado não pertence a nenhum titulo" });
            }
        
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Algo falhou, por favor tente mais tarde" });
    }
};

exports.createComment = async(req, res) => {
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
