module.exports = (mongoose) => {
    const schema = mongoose.Schema(
            {
                imdb_id: { type: String, required: [true, 'O campo imdb_id não pode estar vazio ou ser inválido'] },
                title: { type: String, required: [true, 'O campo title não pode estar vazio ou ser inválido'] },
                synopsis: { type: String, required: [true, 'O campo synopsis não pode estar vazio ou ser inválido'] },
                poster: { type: String, required: [true, 'O campo poster não pode estar vazio ou ser inválido'] },
                poster_webp: { type: String, default: null },
                banner: { type: String, required: [true, 'O campo banner não pode estar vazio ou ser inválido'] },
                banner_webp: { type: String, default: null },
                trailer: { type: String, required: [true, 'O campo trailer não pode estar vazio ou ser inválido'] },
                year: { type: String, required: [true, 'O campo year não pode estar vazio ou ser inválido'] },
                country: { type: String, required: [true, 'O campo country não pode estar vazio ou ser inválido'] },
                language: { type: String, required: [true, 'O campo language não pode estar vazio ou ser inválido'] },
                content_rating: { type: String, required: [true, 'O campo content_rating não pode estar vazio ou ser inválido'] },
                duration: { type: String, required: [true, 'O campo duration não pode estar vazio ou ser inválido'] },
                seasons: { type: Number, required: [true, 'O campo seasons não pode estar vazio ou ser inválido'] },
                platforms: [
                    { 
                        platform_id: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'platform'
                        },
                    }
                ],
                genres: [
                    { 
                        genre_id: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'genre'
                        },
                    }
                ],
                episodes: [
                    {
                        imdb_id: String,
                        season: Number,
                        episode: Number,
                        title: String,
                        banner: String,
                        banner_webp: { type: String, default: null },
                    }
                ],
                cast: [
                    {
                        id: String,
                        image: String,
                        image_webp: { type: String, default: null },
                        name: String,
                        asCharacter: String
                    }
                ],
                producers: [
                    {
                        id: String,
                        name: String,
                        description: String
                    }
                ],
                directors: [
                    {
                        id: String,
                        name: String,
                        description: String
                    }
                ],
                writers: [
                    {
                        id: String,
                        name: String,
                        description: String
                    }
                ],
                imdb_rating: { type: String, required: [true, 'O campo imdb_rating não pode estar vazio ou ser inválido'] },
                comments: [
                    {
                        id: { type: Number },
                        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
                        comment: String,
                        date: { type: Date, default: new Date() },
                        spoiler: { type: Boolean, default: false }
                    }
                ]
            }
        );
        
    const Title = mongoose.model("title", schema);
    return Title;
};