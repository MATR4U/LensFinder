import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

// Load env from monorepo root using a single live .env file (no example fallbacks)
const ROOT = path.resolve(process.cwd());
const MONO_ROOT = path.resolve(ROOT, '..');

function loadDotEnvSingle() {
  if (process.env.SKIP_DOTENV === 'true') return;
  const envPath = path.join(MONO_ROOT, '.env');
  const loaded = dotenv.config({ path: envPath });
  if (loaded.error) {
    throw new Error('Missing required env file .env at repo root.');
  }
}
loadDotEnvSingle();

function buildDbUrlFromParts(): string {
  const user = process.env.POSTGRES_USER || 'lens';
  const pass = process.env.POSTGRES_PASSWORD || 'lens';
  const host = process.env.POSTGRES_HOST || 'localhost';
  const port = process.env.POSTGRES_PORT || '5432';
  const db = process.env.POSTGRES_DB || 'lensfinder';
  return `postgres://${user}:${pass}@${host}:${port}/${db}`;
}

function computeDatabaseUrl(nodeEnv: string): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.trim()) {
    // Tolerate unexpanded shell-style variables in .env by rebuilding from POSTGRES_* parts
    if (envUrl.includes('${')) return buildDbUrlFromParts();
    return envUrl;
  }
  if (nodeEnv !== 'production') {
    // Prefer POSTGRES_* parts when provided (e.g., compose exposing non-default port)
    if (process.env.POSTGRES_DB || process.env.POSTGRES_PORT || process.env.POSTGRES_USER || process.env.POSTGRES_PASSWORD) {
      return buildDbUrlFromParts();
    }
    return 'postgres://lens:lens@localhost:5432/lensfinder';
  }
  throw new Error('DATABASE_URL is required in production');
}

const EnvSchema = z.object({
  HOST: z.string().default('0.0.0.0'),
  PORT: z.coerce.number().default(3001),
  DB_DRIVER: z.string().default('pg'),
  TRUST_PROXY: z.enum(['true', 'false']).default('false'),
  CORS_ALLOWED_ORIGINS: z.string().optional(),
  PRICE_SCRAPE_ALLOWLIST: z.string().optional(),
  REQUEST_SIGNATURE_SECRET: z.string().optional(),
  SIGNATURE_TTL_SECONDS: z.coerce.number().default(300),
  SIGNATURE_EXCLUDE_PATHS: z.string().optional(),
  API_KEY: z.string().optional(),
  CACHE_TTL_S: z.coerce.number().default(300),
  RATE_LIMIT_GLOBAL_PER_MIN: z.coerce.number().default(600),
  RATE_LIMIT_PRICE_PER_MIN: z.coerce.number().default(60),
  JSON_BODY_LIMIT: z.string().default('256kb'),
  LOG_LEVEL: z.string().optional(),
  API_VERSION_CURRENT: z.string().default('v1'),
  API_VERSION_DEPRECATED: z.string().optional(),
  API_VERSION_POLICY_URL: z.string().optional()
});

export function createConfigFromEnv(nodeEnvOverride?: string) {
  loadDotEnvSingle();
  const nodeEnv = nodeEnvOverride ?? (process.env.NODE_ENV === 'production' ? 'production' : (process.env.NODE_ENV || 'development'));
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error('Invalid server environment: ' + parsed.error.message);
  }
  return {
    nodeEnv: nodeEnv as 'development' | 'production' | string,
    host: parsed.data.HOST,
    port: parsed.data.PORT,
    databaseUrl: computeDatabaseUrl(nodeEnv),
    dbDriver: parsed.data.DB_DRIVER,
    trustProxy: parsed.data.TRUST_PROXY === 'true',
    logLevel: parsed.data.LOG_LEVEL || 'info',
    corsAllowedOrigins: (parsed.data.CORS_ALLOWED_ORIGINS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    priceScrapeAllowlist: (parsed.data.PRICE_SCRAPE_ALLOWLIST || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    requestSignatureSecret: parsed.data.REQUEST_SIGNATURE_SECRET,
    signatureTtlSeconds: parsed.data.SIGNATURE_TTL_SECONDS,
    signatureExcludePaths: (parsed.data.SIGNATURE_EXCLUDE_PATHS || '')
      .split(',')
      .map(s => s.trim())
      .filter(Boolean),
    apiKey: (parsed.data.API_KEY || '').trim(),
    cacheTtlSeconds: parsed.data.CACHE_TTL_S,
    rateLimitGlobalPerMin: parsed.data.RATE_LIMIT_GLOBAL_PER_MIN,
    rateLimitPricePerMin: parsed.data.RATE_LIMIT_PRICE_PER_MIN,
    jsonBodyLimit: parsed.data.JSON_BODY_LIMIT,
    apiVersioning: {
      current: parsed.data.API_VERSION_CURRENT || 'v1',
      deprecated: (parsed.data.API_VERSION_DEPRECATED || '')
        .split(',')
        .map(s => s.trim())
        .filter(Boolean),
      policyUrl: parsed.data.API_VERSION_POLICY_URL || undefined,
      sunsets: {}
    } as { current: string; deprecated?: string[]; policyUrl?: string; sunsets?: Record<string, string> }
  };
}

export let config: ReturnType<typeof createConfigFromEnv>;
try {
  config = createConfigFromEnv();
} catch (e) {
  const isVitest = process.env.VITEST === 'true' || process.env.VITEST === '1';
  const isProd = (process.env.NODE_ENV || '').toLowerCase() === 'production';
  if (isVitest && !isProd) {
    // In non-production test envs, fall back to development defaults to allow importing the module.
    config = createConfigFromEnv('development');
  } else {
    throw e;
  }
}


