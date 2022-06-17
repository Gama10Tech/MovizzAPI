const db = require("../models/index.js");
const Theme = db.themes;
const User = db.users;

exports.findAll = async (req, res) => {
    try {
        let data = await Theme.find().exec();
        res.status(200).json({ success: true, msg: data });
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong, please try again later."
        });
    }
};

exports.findOne = async (req, res) => {
    try {
        if (isInt(req.params.theme_id)) {
            const theme = await Theme.findOne({ theme_id: req.params.theme_id }).exec();
            if (theme === null)
                return res.status(404).json({
                    success: false, msg: "The ID specified does not belong to any theme."
                });
    
            res.json({ success: true, msg: theme });
        } else {
            res.status(404).json({ success: false, msg: "The field 'theme_id' cannot be empty or invalid."});
        }
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong, please try again later."
        });
    }
};

function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}

