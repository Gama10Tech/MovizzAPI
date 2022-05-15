module.exports = (mongoose) => {
    const schema = mongoose.Schema(
            {
                theme_id: Number,
                description: String
            }
        );

    const Theme = mongoose.model("theme", schema);
    return Theme;
};