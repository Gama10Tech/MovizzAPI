const db = require("../models/index.js");
const Genre = db.genres;
const User = db.users;

exports.findAll = async (req, res) => {
    try {
        let data = await Genre.find().exec();
        res.status(200).json({ success: true, msg: data });
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong, please try again later."
        });
    }
};

exports.findOne = async (req, res) => {
    try {
        if (isInt(req.params.genre_id)) {
            const genre = await Genre.findOne({ genre_id: req.params.genre_id }).exec();
            if (genre === null)
                return res.status(404).json({
                    success: false, msg: "The ID specified does not belong to any genre."
                });
    
            res.json({ success: true, msg: genre });
        } else {
            res.status(404).json({ success: false, msg: "The field 'genre_id' cannot be empty or invalid." });
        }
    }
    catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
    }
};

function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}

