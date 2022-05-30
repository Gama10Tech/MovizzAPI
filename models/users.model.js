module.exports = (mongoose) => {
    const schema = mongoose.Schema(
            {
                id: { type: Number },
                register_date: { type: Date, default: new Date() },
                first_name: { type: String, required: [true, 'O campo first_name não pode estar vazio ou ser inválido'] },
                last_name: { type: String, required: [true, 'O campo last_name não pode estar vazio ou ser inválido'] },
                email: { type: String, required: [true, 'O campo email não pode estar vazio ou ser inválido'] },
                password: { type: String, required: [true, 'O campo password não pode estar vazio ou ser inválido'] },
                dob: { type: Date, required: [true, 'O campo dob não pode estar vazio ou ser inválido'] },
                avatar: { type: String, default: 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png' },
                badge_id: { 
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'badge',
                    default: '627e99e85340d894c9127a6a'
                },
                points: { type: Number, default: 0 },
                xp: { type: Number, default: 0 },
                is_admin: { type: Boolean, default: false },
                is_locked: { type: Boolean, default: false },
                played: [
                    {
                        quiz_id: { 
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'quiz'
                        }
                    }                        
                ],
                quiz_ratings: [
                    {
                        quiz_id: { 
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'quiz'
                        },
                        rating: Number
                    }
                ],
                title_ratings: [
                    {
                        title_id: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'title'
                        },
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
                        prize_id: {
                            type: mongoose.Schema.Types.ObjectId,
                            ref: 'prize'
                        },
                        date: {
                            type: Date,
                            default: new Date()
                        }
                    } 
                ],
                stats: {
                    level: { type: Number, default: 0 },
                    quizzes_completed: { type: Number, default: 0 },
                    questions_right: { type: Number, default: 0 },
                    questions_wrong: { type: Number, default: 0 }
                }
            }
        );

    const User = mongoose.model("user", schema);
    return User;
};