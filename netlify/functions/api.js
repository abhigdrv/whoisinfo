import express, { Router } from 'express';
import serverless from 'serverless-http';
const whois = require('whois-json');

const api = express();

const router = Router();
router.get('/hello', (req, res) => res.send('Hello World!'));

app.post('/whois', async (req, res) => {
    try {
      const domains = req.body.domains;
      const results = await Promise.all(domains.map(domain => whois(domain)));
      res.json(results);
    } catch (error) {
      res.status(500).json({ error: 'An error occurred' });
    }
});

api.use('/api/', router);

export const handler = serverless(api);