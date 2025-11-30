import express from 'express';
import { env } from './env';

const app = express();

app.get('/status', (_req, res) => {
    res.json({ status: 'ok' });
});

app.listen(env.PORT, () => {
    console.log(`API server running on http://localhost:${env.PORT}`);
});