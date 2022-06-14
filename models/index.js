const dbConfig = require('../config/db.config.js');
const mongoose = require("mongoose");
const db = {};

db.mongoose = mongoose;
db.url = dbConfig.URL;

(async () => {
    try {
        await db.mongoose.connect(db.url,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }
            );
        console.log("Connected to the database!");
    } catch (error) {
        console.log("Cannot connect to the database!", error);
        process.exit();
    }
})();

db.badges = require("./badges.model.js")(mongoose);
db.users = require("./users.model.js")(mongoose);
db.quizzes = require("./quizzes.model.js")(mongoose);
db.platforms = require("./platforms.model.js")(mongoose);
db.titles = require("./titles.model.js")(mongoose);
db.themes = require("./themes.model.js")(mongoose);
db.genres = require("./genres.model.js")(mongoose);
db.prizes = require("./prizes.model.js")(mongoose);
db.secret = dbConfig.SECRET;

module.exports = db;