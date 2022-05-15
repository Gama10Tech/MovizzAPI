const config = {
    /* don't expose password or any sensitive info, done only for demo */
    // if environment variables are not defined, use default values
    USER: process.env.DB_USER,
    PASSWORD: process.env.DB_PASSWORD,
    DB: process.env.DB_NAME
};
//mongodb+srv://root:<password>@cluster0.zsbcu.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
config.URL = `mongodb+srv://${config.USER}:${config.PASSWORD}@cluster0.zsbcu.mongodb.net/${config.DB}?retryWrites=true&w=majority`;
module.exports = config;