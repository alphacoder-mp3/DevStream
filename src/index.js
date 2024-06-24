import express from 'express';
import { config } from 'dotenv';
import connectDB from './db/index.js';

config({ path: './env' });
connectDB();
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/twitter', (req, res) => {});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
