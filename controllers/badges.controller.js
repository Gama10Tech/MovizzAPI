const db = require("../models/index.js");
const Badge = db.badges;
const User = db.users;

exports.findAll = async (req, res) => {
    try {
        let data = await Badge.find().exec();
        res.status(200).json({ success: true, msg: data });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
    }
};

exports.findOne = async (req, res) => {
    try {
        if (isInt(req.params.badge_id)) {
            const badge = await Badge.findOne({ badge_id: req.params.badge_id }).exec();
            if (badge === null)
                return res.status(404).json({
                    success: false, msg: "The ID specified does not belong to any badge."
                });
    
            res.json({ success: true, msg: badge });
        } else {
            res.status(404).json({ success: false, msg: "The field 'badge_id' cannot be empty or invalid." });
        }
    }
    catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
    }
};

function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}

