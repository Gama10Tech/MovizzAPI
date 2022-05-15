module.exports = (mongoose) => {
    const schema = mongoose.Schema(
            {
                genre_id: Number,
                description: String
            }
        );

    const Genre = mongoose.model("genre", schema);
    return Genre;
};