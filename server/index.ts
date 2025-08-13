import express from 'express';
import type { Request, Response } from 'express';
import path from 'path';
import fsSync from 'fs';
import { createRouter } from './router.js';
import { config } from './config.js';
import client from 'prom-client';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pinoImport from 'pino';
import pinoHttpImport from 'pino-http';
import { schema } from './graphql.js';
import { createGraphQLHandler } from './graphqlHandler.js';
import fs from 'fs';
import compression from 'compression';

const app = express();
app.use(helmet());
app.use(compression());
const pinoFn = (pinoImport as any).default || (pinoImport as any);
const pinoHttpFn = (pinoHttpImport as any).default || (pinoHttpImport as any);
app.use(pinoHttpFn({
  logger: pinoFn({ level: (config as any).logLevel || process.env.LOG_LEVEL || 'info', redact: ['req.headers.authorization', 'req.headers.cookie'] })
}));

// Request rate limiting and body size limits
const rateLimitHandler = (req: any, res: any) => {
  try {
    const resetTime = req?.rateLimit?.resetTime;
    if (resetTime instanceof Date) {
      const seconds = Math.max(1, Math.ceil((resetTime.getTime() - Date.now()) / 1000));
      res.setHeader('Retry-After', String(seconds));
    }
  } catch {}
  res.status(429).type('application/problem+json').json({ type: 'about:blank', title: 'Too Many Requests', status: 429 });
};
app.use(rateLimit({ windowMs: 60_000, max: (config as any).rateLimitGlobalPerMin || 600, standardHeaders: true, legacyHeaders: false, handler: rateLimitHandler }));
// Per-route stricter rate limit for price scraping
app.use('/api/price', rateLimit({ windowMs: 60_000, max: (config as any).rateLimitPricePerMin || 60, standardHeaders: true, legacyHeaders: false, handler: rateLimitHandler }));
// Capture raw body for HMAC verification while also parsing JSON
app.use(express.json({ limit: (config as any).jsonBodyLimit || '256kb', verify: (req, _res, buf) => { (req as any).rawBody = buf.toString('utf8'); } }));

// Optional CORS for cross-origin client setups
if (config.corsAllowedOrigins.length > 0) {
  app.use(cors({ origin: config.corsAllowedOrigins, credentials: true }));
}

// Standardize HTTP caching semantics across responses
app.use((req, res, next) => {
  try { res.vary('Accept'); } catch {}
  try { res.vary('Accept-Encoding'); } catch {}
  try { if ((config as any).corsAllowedOrigins && (config as any).corsAllowedOrigins.length > 0) res.vary('Origin'); } catch {}
  next();
});

const ROOT = path.resolve(process.cwd()); // server workspace root
const MONO_ROOT = path.resolve(ROOT, '..'); // monorepo root
// Config is already loaded in server/config

const CLIENT_DIST_DIR = path.join(MONO_ROOT, 'client', 'dist');
const CLIENT_INDEX_HTML = path.join(CLIENT_DIST_DIR, 'index.html');

// Quiet missing favicon requests
app.get('/favicon.ico', (_req: Request, res: Response) => {
  res.status(204).end();
});

// Serve client build when available
if (fsSync.existsSync(CLIENT_DIST_DIR) && fsSync.existsSync(CLIENT_INDEX_HTML)) {
  app.use('/', express.static(CLIENT_DIST_DIR));
  app.get('/', (_req: Request, res: Response) => {
    res.sendFile(CLIENT_INDEX_HTML);
  });
}

// Service index for discoverability
app.get('/api', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Vary', 'Accept, Accept-Encoding, Origin');
  res.json({
    name: 'LensFinder API',
    version: 1,
    _links: {
      self: { href: '/api' },
      cameras: { href: '/api/cameras' },
      lenses: { href: '/api/lenses' },
      report: { href: '/api/report' },
      events: { href: '/api/events' },
      openapi: { href: '/openapi.json' },
      docs: { href: '/docs' }
    },
    _templates: {
      report: {
        method: 'POST',
        contentType: 'application/json',
        target: '/api/report',
        properties: [
          { name: 'cameraName', type: 'string', required: false },
          { name: 'goal', type: 'string', required: true },
          { name: 'top', type: 'array', required: true, description: 'Array of ranked items with name,total,weight_g,price_chf,type' }
        ]
      }
    }
  });
});

// HEAD for service index
app.head('/api', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Vary', 'Accept, Accept-Encoding, Origin');
  res.status(200).end();
});

// HEAD variant for service index with identical headers
app.head('/api', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Vary', 'Accept, Accept-Encoding, Origin');
  res.type('application/json').status(200).end();
});

// Optional request-signature enforcement
try {
  const { createSignatureMiddleware } = await import('./utils/http.js');
  const exclude = (config as any).signatureExcludePaths && (config as any).signatureExcludePaths.length > 0
    ? (config as any).signatureExcludePaths
    : String(process.env.SIGNATURE_EXCLUDE_PATHS || '/graphql,/api/health').split(',').map(s => s.trim()).filter(Boolean);
  app.use(createSignatureMiddleware((config as any).requestSignatureSecret, (config as any).signatureTtlSeconds, exclude));
} catch {}

// Mount API router once (dev and prod). This avoids dev SSR scanning issues.
// Versioned alias: /v1/* maps to same router to future-proof clients.
const baseRouter = createRouter({ rootDir: ROOT });
app.use(baseRouter);
const v1Router = express.Router();
v1Router.use((req, _res, next) => {
  if (req.url === '/' || req.url === '') return next();
  if (req.url.startsWith('/api/')) return next();
  req.url = '/api' + (req.url.startsWith('/') ? req.url : '/' + req.url);
  next();
});
v1Router.use(baseRouter);
app.use('/v1', v1Router);

// Observability metrics
const register = new client.Registry();
client.collectDefaultMetrics({ register });
app.get('/metrics', async (_req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.end(await register.metrics());
});
// HEAD for /metrics
app.head('/metrics', (_req: Request, res: Response) => {
  res.set('Content-Type', register.contentType);
  res.status(200).end();
});

// GraphQL endpoint mounted alongside REST
function requireApiKey(req: Request, res: Response, next: Function) {
  if (process.env.NODE_ENV === 'test') return next();
  const expected = (config as any).apiKey && String((config as any).apiKey).trim();
  if (!expected) return next();
  const provided = req.header('x-api-key');
  if (provided && provided === expected) return next();
  res.status(401).type('application/problem+json').json({ type: 'about:blank', title: 'Unauthorized', status: 401 });
}
app.post('/graphql', requireApiKey as any, createGraphQLHandler(schema));
// GraphiQL in development only
if (config.nodeEnv !== 'production') {
  app.get('/graphiql', (_req: Request, res: Response) => {
    const html = [
      '<!DOCTYPE html>',
      '<html>',
      '<head><meta charset="utf-8"/><title>GraphiQL</title>',
      '<link rel="stylesheet" href="https://unpkg.com/graphiql/graphiql.min.css" />',
      '</head>',
      '<body style="margin:0">',
      '<div id="graphiql" style="height:100vh;"></div>',
      '<script crossorigin src="https://unpkg.com/react/umd/react.development.js"></script>',
      '<script crossorigin src="https://unpkg.com/react-dom/umd/react-dom.development.js"></script>',
      '<script src="https://unpkg.com/graphiql/graphiql.min.js"></script>',
      '<script>const graphQLFetcher = graphQLParams => fetch("/graphql", {method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(graphQLParams)}).then(r => r.json()); ReactDOM.render(React.createElement(GraphiQL, { fetcher: graphQLFetcher }), document.getElementById("graphiql"));</script>',
      '</body></html>'
    ].join('');
    res.type('text/html').send(html);
  });
}

// Serve openapi.json if present in server directory
app.get('/openapi.json', (_req: Request, res: Response) => {
  const candidate = path.join(ROOT, 'openapi.json');
  const serverPath = path.join(ROOT, 'server', 'openapi.json');
  const builtPath = path.join(ROOT, 'dist', '..', 'openapi.json');
  const filePath = fs.existsSync(candidate)
    ? candidate
    : (fs.existsSync(serverPath)
      ? serverPath
      : (fs.existsSync(builtPath) ? builtPath : null));
  if (!filePath) {
    res.status(404).type('application/problem+json').json({ type: 'about:blank', title: 'Not Found', status: 404, detail: 'openapi.json not found' });
    return;
  }
  const body = fs.readFileSync(filePath, 'utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=300');
  res.setHeader('ETag', 'W/"' + Buffer.byteLength(body) + '"');
  res.type('application/json').send(body);
});

// HEAD support mirroring GET /openapi.json headers
app.head('/openapi.json', (_req: Request, res: Response) => {
  const candidate = path.join(ROOT, 'openapi.json');
  const serverPath = path.join(ROOT, 'server', 'openapi.json');
  const builtPath = path.join(ROOT, 'dist', '..', 'openapi.json');
  const filePath = fs.existsSync(candidate)
    ? candidate
    : (fs.existsSync(serverPath)
      ? serverPath
      : (fs.existsSync(builtPath) ? builtPath : null));
  if (!filePath) {
    res.status(404).type('application/problem+json').json({ type: 'about:blank', title: 'Not Found', status: 404, detail: 'openapi.json not found' });
    return;
  }
  const body = fs.readFileSync(filePath, 'utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=300');
  res.setHeader('ETag', 'W/"' + Buffer.byteLength(body) + '"');
  res.type('application/json').status(200).end();
});

// Swagger UI and Redoc at /docs
app.get('/docs', (req: Request, res: Response) => {
  const base = `${req.protocol}://${req.get('host')}`;
  const specUrl = `${base}/openapi.json`;
  const html = [
    '<!DOCTYPE html>',
    '<html>',
    '<head>',
    '<meta charset="utf-8"/>',
    '<meta name="viewport" content="width=device-width, initial-scale=1"/>',
    '<title>API Docs</title>',
    '<style>body{margin:0;font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Noto Sans,Helvetica Neue,Arial}.tabs{display:flex;gap:8px;padding:8px;border-bottom:1px solid #eee}.tabs a{text-decoration:none;padding:6px 10px;border-radius:6px;border:1px solid #ddd;color:#222}.tabs a.active{background:#f5f5f5}iframe{width:100%;height:calc(100vh - 46px);border:0}</style>',
    '</head>',
    '<body>',
    '<div class="tabs">',
    '<a href="#swagger" id="tab-sw">Swagger UI</a>',
    '<a href="#redoc" id="tab-rd">Redoc</a>',
    '<a href="' + specUrl + '" target="_blank">openapi.json</a>',
    '</div>',
    '<iframe id="frame" src=""></iframe>',
    '<script>',
    'const sw=document.getElementById("tab-sw");',
    'const rd=document.getElementById("tab-rd");',
    'const frame=document.getElementById("frame");',
    'function setActive(hash){sw.classList.toggle("active",hash==="#swagger");rd.classList.toggle("active",hash==="#redoc");}',
    'function navigate(){',
    ' const hash=location.hash||"#swagger";',
    ' setActive(hash);',
    ' if(hash==="#redoc"){',
    '  frame.srcdoc=' + JSON.stringify('<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Redoc</title><script src="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js"></script></head><body><redoc spec-url="' + specUrl + '"></redoc></body></html>') + ';',
    ' } else {',
    '  frame.srcdoc=' + JSON.stringify('<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Swagger UI</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@latest/swagger-ui.css" /></head><body><div id="swagger-ui"></div><script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@latest/swagger-ui-bundle.js"><\/script><script>window.ui = SwaggerUIBundle({ url: "' + specUrl + '", dom_id: "#swagger-ui" });<\/script></body></html>') + ';',
    ' }',
    '}',
    'window.addEventListener("hashchange", navigate);',
    'navigate();',
    '</script>',
    '</body>',
    '</html>'
  ].join('');
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=300');
  res.type('text/html').send(html);
});
// HEAD for /docs mirroring headers
app.head('/docs', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'public, max-age=3600, stale-while-revalidate=300');
  res.type('text/html').status(200).end();
});
// Readiness endpoint that checks DB connectivity
app.get('/ready', async (_req: Request, res: Response) => {
  try {
    const { getPool } = await import('./db/pg.js');
    await getPool().query('SELECT 1');
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not-ready' });
  }
});
// Respect reverse proxies in production when TRUST_PROXY is true
if (config.trustProxy) {
  app.set('trust proxy', 1);
}

// Centralized RFC7807 error handler (must be after routes)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: Function) => {
  const status = typeof err?.status === 'number' ? err.status : 500;
  const title = err?.title || (status === 500 ? 'Internal Server Error' : 'Error');
  const detail = typeof err?.message === 'string' ? err.message : undefined;
  res.status(status)
    .type('application/problem+json')
    .json({ type: 'about:blank', title, status, detail });
});

export const appInstance = app;
if (process.env.VITEST !== 'true') {
let server: import('http').Server | null = null;
if (!process.env.VITEST) {
  server = app.listen(config.port, () => {
  const host = config.host;
  // eslint-disable-next-line no-console
  console.log(`Server listening on ${host}:${config.port}`);
  // eslint-disable-next-line no-console
  console.log(`Client dev server (Vite) recommended: cd client && npm run dev`);
  });
}

function shutdown(signal: string) {
  // eslint-disable-next-line no-console
  console.log(`\nReceived ${signal}. Shutting down gracefully...`);
  (server || { close: (fn: Function) => fn() }).close(async () => {
    try {
      const { getPool } = await import('./db/pg.js');
      await getPool().end();
    } catch {}
    // eslint-disable-next-line no-console
    console.log('Shutdown complete');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
}


