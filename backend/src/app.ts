import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import gamesRouter from './routes/games.route.js';

dotenv.config();
const PORT = process.env.PORT || 5003;

const app = express();

// CORS — разрешить все домены (для обучения)
app.use(cors());

// Или строже: только определённые порты разработки
// app.use(cors({
// 	origin: ['http://localhost:3000', 'http://127.0.0.1:5500'],
// 	methods: ['GET', 'POST', 'PUT', 'DELETE'],
// 	allowedHeaders: ['Content-Type'],
// }));

// Middleware
app.use(express.json());

app.use('/api/games', gamesRouter);

app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req, res) => {
	res.status(404).json({ message: 'Endpoint not found' });
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
