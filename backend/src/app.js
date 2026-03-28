import cors from 'cors';
import express from 'express';
import morgan from 'morgan';
import routes from './routes/index.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use('/api', routes);

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Internal server error' });
});

export default app;
