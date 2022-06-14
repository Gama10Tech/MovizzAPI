const db = require("../models/index.js");
const Prize = db.prizes;
const User = db.users;

exports.findAll = async (req, res) => {
    try {
        let data = await Prize.find().exec();
        res.status(200).json({ success: true, msg: data });
    } catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong, please try again later."
        });
    }
};

exports.findOne = async (req, res) => {
    try {
        if (isInt(req.params.prize_id)) {
            const prize = await Prize.findOne({ prize_id: req.params.prize_id }).exec();
            if (prize === null)
                return res.status(404).json({
                    success: false, msg: "The ID specified does not belong to any prize."
                });
    
            res.json({ success: true, msg: prize });
        } else {
            res.status(404).json({ success: false, msg: "The field 'prize_id' cannot be empty or invalid." });
        }
    }
    catch (err) {
        res.status(500).json({
            success: false, msg: err.message || "Something went wrong, please try again later."
        });
    }
};

exports.edit = async(req, res) => {
    const userInitiator = await User.findOne({ id: req.loggedUserId }).exec();

    if (userInitiator.is_admin) {
        try {
            const prizeData = await Prize.findOne({ prize_id: req.params.prize_id.toString().trim()}).exec();
            if (prizeData) {
                if (!req.body.name.toString().trim()) {
                    res.status(400).json({ success: false, msg: "The field 'name' cannot be empty or invalid." });
                }
                else if (!req.body.image.toString().trim()) {
                    res.status(400).json({ success: false, msg: "The field 'image' cannot be empty or invalid." });
                }
                else if (!req.body.price.toString().trim()) {
                    res.status(400).json({ success: false, msg: "The field 'price' cannot be empty or invalid." });
                } else {
                    prizeData.name = req.body.name;
                    prizeData.image = req.body.image;
                    prizeData.price = req.body.price;
                    await prizeData.save();
                    res.status(200).json({ success: true, msg: "The prize ID " + prizeData.prize_id + " has been edited successfully.", location: "/api/prizes/" + prizeData.prize_id, data: prizeData });
                }
            } else {
                res.status(404).json({ success: false, msg: "The ID specified does not belong to any prize." });
            }
        } catch (err) {
            res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
        }
    } else {
        res.status(401).json({ success: false, msg: "You are not authorized to make this request." });
    }
}

exports.remove = async(req, res) => {
    const userInitiator = await User.findOne({ id: req.loggedUserId })
    .populate("prizes_reedemed.prize_id")
    .exec();
    
    if (userInitiator.is_admin) {
        try {
            const prizeData = await Prize.findOne({ prize_id: req.params.prize_id.toString().trim()}).exec();
            
            if (prizeData) {
                const allUsers = await User.find({}, "title_ratings seen favourites").populate("prizes_reedemed.prize_id").exec();

                allUsers.forEach(async user => {
                    user.prizes_reedemed = user.prizes_reedemed.filter(prize => prize.prize_id.prize_id.toString() != prizeData.prize_id.toString());
                    await user.save();
                });

                await prizeData.remove();
                res.status(200).json({ success: true, msg: "The prize has been removed successfully." });
            } else {
                res.status(404).json({ success: false, msg: "The ID specified does not belong to any prize." });
            }
        } catch (err) {
            res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
        }
    } else {
        res.status(401).json({ success: false, msg: "You are not authorized to make this request." });
    }
}

exports.create = async(req, res) => {
    const userInitiator = await User.findOne({ id: req.loggedUserId }); // This will always be available
    
    if (userInitiator.is_admin) {
        try {
            if (!req.body.name || !req.body.name.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'name' cannot be empty or invalid." });
            }
            else if (!req.body.image || !req.body.image.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'image' cannot be empty or invalid." });
            }
            else if (!req.body.price || !req.body.price.toString().trim()) {
                res.status(400).json({ success: false, msg: "The field 'price' cannot be empty or invalid." });
            }
            else {
                const allPrizes = await Prize.find({}).exec();
                const newPrize = new Prize({
                    prize_id: Math.max(...allPrizes.map(a => a.prize_id)) + 1,
                    name: req.body.name,
                    image: req.body.image,
                    price: req.body.price
                });

                await newPrize.save();
                res.status(201).json({ success: true, msg: "The prize has been added to the database successfully.", location: "/api/prizes/" + newPrize.prize_id, data: newPrize });
            }
        }
        catch (err) {
            res.status(500).json({ success: false, msg: err.message || "Something went wrong, please try again later." });
        }
    } else {
        res.status(401).json({ success: false, msg: "You are not authorized to make this request." });
    }
}

function isInt(value) {
    return !isNaN(value) && parseInt(Number(value)) == value && !isNaN(parseInt(value, 10));
}

