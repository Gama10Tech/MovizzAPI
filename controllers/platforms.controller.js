const db = require("../models/index.js");
const Platform = db.platforms;
const User = db.users;

exports.findAll = async (req, res) => {
    try {
        let data = await Platform.find().exec();
        res.status(200).json({ success: true, msg: data });
    } catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
    }
};

exports.findOne = async (req, res) => {
    try {
        if (isInt(req.params.platform_id)) {
            const platform = await Platform.findOne({ platform_id: req.params.platform_id }).exec();

            if (platform === null)
                return res.status(404).json({
                    success: false, msg: "The ID specified does not belong to any platform."
                });
    
            res.json({ success: true, msg: platform });
        } else {
            res.status(404).json({ success: false, msg: "The field 'platform_id' cannot be empty or invalid." });
        }
    }
    catch (err) {
        res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
    }
};

function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}

