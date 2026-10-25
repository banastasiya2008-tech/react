import 'reflect-metadata';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import gamesRouter from './routes/games.route.js';
import authRouter from './routes/auth.route.js';
import userRouter from './routes/user.route.js';
import { AppDataSource } from './data-source.js';

dotenv.config();

const PORT = process.env.PORT || 5003;
const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/games', gamesRouter);
app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Сначала подключаемся к БД через TypeORM, потом поднимаем сервер
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected (TypeORM)');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });