import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import userRouter from './routes/userRouter.js';
import projectRouter from './routes/projectRouter.js';
import cookieParser from 'cookie-parser';
import aiRoutes from './routes/aiRoutes.js'
import cors from 'cors';

connect();

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/users', userRouter);
app.use('/projects', projectRouter);
app.use('/ai',aiRoutes)

app.get('/', (req, res) => {
  res.send('Hello World!');
});

export default app;