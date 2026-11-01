import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { lookupsRouter } from './routes/lookups.js';
import { commentsRouter } from './routes/comments.js';
import { DotnetApiError } from './dotnetClient.js';

const app = express();

app.use(cors({ origin: config.frontendOrigin, credentials: true }));
app.use(express.json());

app.use('/api', lookupsRouter);
app.use('/api', commentsRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err instanceof DotnetApiError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`Middleware listening on http://localhost:${config.port} (dotnet api: ${config.dotnetApiBaseUrl})`);
});
