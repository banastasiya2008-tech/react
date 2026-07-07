import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import gamesRouter from './routes/games.route.js';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';

dotenv.config();

const PORT = process.env.PORT || 5003;
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/games', gamesRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});