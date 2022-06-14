require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;	 	
const host = process.env.HOST; 	

// const corsOptions = {
//     origin: "http://localhost:8080"
// };

// app.use(cors(corsOptions));
app.use(cors());
app.use(express.json());

app.get('/api', function (req, res) {
    res.status(200).json({ message: 'Home -- Movizz API' });
});

app.use('/api/auth', require('./routes/auth.routes.js'))

app.use('/api/users', require('./routes/users.routes.js'))

app.use('/api/quizzes', require('./routes/quizzes.routes.js'))

app.use('/api/badges', require('./routes/badges.routes.js'))

app.use('/api/platforms', require('./routes/platforms.routes.js'))

app.use('/api/titles', require('./routes/titles.routes.js'))

app.use('/api/genres', require('./routes/genres.routes.js'))

app.use('/api/themes', require('./routes/themes.routes.js'))

app.use('/api/prizes', require('./routes/prizes.routes.js'))

app.all('*', function (req, res) {
    res.status(404).json({ message: 'O recurso acedido não existe' });
})

app.listen(port, host, () => console.log(`App listening at http://${host}:${port}/`));
