import express from 'express';
import { config } from 'dotenv';

config();
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.get('/twitter', (req, res) => {});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
