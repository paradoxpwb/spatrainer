import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { SERVER_CONFIG } from './server/config.ts';
import transcribeRoute from './server/routes/transcribeRoute.ts';
import coachRoute from './server/routes/coachRoute.ts';
import compareRoute from './server/routes/compareRoute.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function resolvePort(): number {
  const portArgIndex = process.argv.indexOf('--port');
  if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
    const parsed = parseInt(process.argv[portArgIndex + 1], 10);
    if (!isNaN(parsed)) return parsed;
  }
  const pArgIndex = process.argv.indexOf('-p');
  if (pArgIndex !== -1 && process.argv[pArgIndex + 1]) {
    const parsed = parseInt(process.argv[pArgIndex + 1], 10);
    if (!isNaN(parsed)) return parsed;
  }
  if (process.env.NODE_ENV === 'production' && process.env.PORT) {
    const parsed = parseInt(process.env.PORT, 10);
    if (!isNaN(parsed)) return parsed;
  }
  return SERVER_CONFIG.port || 3000;
}

async function startServer() {
  const app = express();
  const port = resolvePort();

  // JSON and URL-encoded body parsing
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Top-level & API Health check endpoints
  const healthHandler = (_req: express.Request, res: express.Response) => {
    res.json({
      status: 'ok',
      service: 'spa-speaking-trainer-api',
      provider: SERVER_CONFIG.provider,
      model: SERVER_CONFIG.model,
      hasApiKey: Boolean(SERVER_CONFIG.geminiApiKey),
    });
  };
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);

  // API Routes
  app.use('/api', transcribeRoute);
  app.use('/api', coachRoute);
  app.use('/api', compareRoute);

  // Vite integration: Dev middleware in development, static files in production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const fs = await import('fs/promises');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);

    // Dev mode SPA fallback for any page navigation requests
    app.use('*', async (req, res, next) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/health')) {
        return next();
      }
      try {
        const url = req.originalUrl;
        const rawTemplate = await fs.readFile(path.resolve(__dirname, 'index.html'), 'utf-8');
        const template = await vite.transformIndexHtml(url, rawTemplate);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[SPA Speaking Trainer] Server running at http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
