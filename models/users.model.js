module.exports = (mongoose) => {
    const schema = mongoose.Schema(
            {
                id: { type: Number, required: [false, 'O campo id não pode estar vazio ou ser inválido'] },
                register_date: { type: Date, required: [true, 'O campo register_date não pode estar vazio ou ser inválido'] },
                first_name: { type: String, required: [true, 'O campo first_name não pode estar vazio ou ser inválido'] },
                last_name: { type: String, required: [true, 'O campo last_name não pode estar vazio ou ser inválido'] },
                email: { type: String, required: [true, 'O campo email não pode estar vazio ou ser inválido'] },
                password: { type: String, required: [true, 'O campo password não pode estar vazio ou ser inválido'] },
                dob: { type: Date, required: [true, 'O campo dob não pode estar vazio ou ser inválido'] },
                avatar: { type: String, required: [true, 'O campo avatar não pode estar vazio ou ser inválido'] },
                badge_id: { 
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'badge',
                    required: [true, 'O campo badge_id não pode estar vazio ou ser inválido']
                },
                points: { type: Number, required: [true, 'O campo points não pode estar vazio ou ser inválido'] },
                xp: { type: Number, required: [true, 'O campo xp não pode estar vazio ou ser inválido'] },
                is_admin: { type: Boolean, required: [true, 'O campo is_admin não pode estar vazio ou ser inválido'] },
                is_locked: { type: Boolean, required: [true, 'O campo is_locked não pode estar vazio ou ser inválido'] },
                played: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'quiz'
                    }                        
                ],
                quiz_ratings: [
                    
                ],
                title_ratings: [
                    {
                        title_id: {type: mongoose.Schema.Types.ObjectId, ref: 'title'},
                        rating: Number
                    }
                ],
                seen: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'title'
                    } 
                ],
                favourites: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'title'
                    } 
                ],
                prizes_reedemed: [
                    {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: 'prize'
                    } 
                ],
                stats: {
                    level: { type: Number, required: [true, 'O campo level não pode estar vazio ou ser inválido'] },
                    quizzes_completed: { type: Number, required: [true, 'O campo quizzes_completed não pode estar vazio ou ser inválido'] },
                    questions_right: { type: Number, required: [true, 'O campo questions_right não pode estar vazio ou ser inválido'] },
                    questions_wrong: { type: Number, required: [true, 'O campo questions_wrong não pode estar vazio ou ser inválido'] },
                    times_help_needed: { type: Number, required: [true, 'O campo times_help_needed não pode estar vazio ou ser inválido'] }
                }
            }
        );

    const User = mongoose.model("user", schema);
    return User;
};