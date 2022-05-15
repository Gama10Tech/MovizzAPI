module.exports = (mongoose) => {
    const schema = mongoose.Schema(
            {
                platform_id: Number,
                name: String,
            }
        );
        
    const Platform = mongoose.model("platform", schema);
    return Platform;
};
