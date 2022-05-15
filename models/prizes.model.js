module.exports = (mongoose) => {
    const schema = mongoose.Schema(
            {
                prize_id: Number,
                name: String,
                image: String,
                price: Number
            }
        );

    const Prize = mongoose.model("prize", schema);
    return Prize;
};