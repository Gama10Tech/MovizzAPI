module.exports = (mongoose) => {
    const schema = mongoose.Schema(
            {
                email: String,
                password: String
            }
        );

    const Auth = mongoose.model("auth", schema);
    return Auth;
};