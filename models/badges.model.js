module.exports = (mongoose) => {
    const schema = mongoose.Schema(
            {
                icon: String,
                badge_id: Number,
                name: String,
                xp_min: Number,
                xp_max: Number,
                level: Number,
            }
        );

    const Badge = mongoose.model("badge", schema);
    return Badge;
};