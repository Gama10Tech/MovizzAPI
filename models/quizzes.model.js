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
                theme_id: { type: String, required: [true, 'O campo theme_id não pode estar vazio ou ser inválido'] },
                poster: { type: String, required: [true, 'O campo poster não pode estar vazio ou ser inválido'] },
                poster_webp: { type: String, required: [true, 'O campo poster_webp não pode estar vazio ou ser inválido'] },
                banner: { type: String, required: [true, 'O campo banner não pode estar vazio ou ser inválido'] },
                banner_webp: { type: String, required: [true, 'O campo banner_webp não pode estar vazio ou ser inválido'] },
                questions: [],
                comments: [],
            }
        );
        
    const Quiz = mongoose.model("quiz", schema);
    return Quiz;
};
