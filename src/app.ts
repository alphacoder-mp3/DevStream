import express, { Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app: Express = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: '16kb' }));

app.use(express.urlencoded({ extended: true, limit: '16kb' }));

app.use(express.static('public'));

app.use(cookieParser());

// Routes import
import userRouter from './routes/user.routes';
import subscriptionRouter from './routes/subscription.routes';
import playlistRouter from './routes/playlist.routes';

app.use('/api/v1/users', userRouter);
app.use('/api/v1/subscription', subscriptionRouter);
app.use('/api/v1/playlist', playlistRouter);

export { app };
