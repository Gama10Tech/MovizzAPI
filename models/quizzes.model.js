module.exports = (mongoose) => {
    const schema = mongoose.Schema(
            {
                quiz_id: { type: Number, required: [true, 'O campo quiz_id não pode estar vazio ou ser inválido'] },
                type: {
                    description: { type: String, required: [true, 'O campo description não pode estar vazio ou ser inválido'] },
                    questions: { type: Number, required: [true, 'O campo questions não pode estar vazio ou ser inválido'] }
                },
                difficulty:{
                    description: { type: String, required: [true, 'O campo description não pode estar vazio ou ser inválido'] },
                    question_points: { type: Number, required: [true, 'O campo question_points não pode estar vazio ou ser inválido'] }
                },
                is_specific: { type: Boolean, required: [true, 'O campo is_specific não pode estar vazio ou ser inválido'] },
                title: { type: String, required: [true, 'O campo title não pode estar vazio ou ser inválido'] },
                description: { type: String, required: [true, 'O campo description não pode estar vazio ou ser inválido'] },
                theme_id: { type: mongoose.Schema.Types.ObjectId, ref: 'theme' },
                poster: { type: String, required: [true, 'O campo poster não pode estar vazio ou ser inválido'] },
                poster_webp: { type: String, default: null },
                banner: { type: String, required: [true, 'O campo banner não pode estar vazio ou ser inválido'] },
                banner_webp: { type: String, default: null },
                questions: [
                    {
                        question_id: Number,
                        imdb_id: String,
                        content: String,
                        type: { type: String, default: "texto" },
                        image: String,
                        options: [
                            {
                                content: String,
                                correct: Boolean
                            }
                        ]
                    }
                ],
                comments: [
                    {
                        id: { type: Number },
                        user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
                        comment: String,
                        date: { type: Date, default: new Date() }
                    }
                ],
                times_played: { type: Number, default: 0 }
            }
        );
        
    const Quiz = mongoose.model("quiz", schema);
    return Quiz;
};
