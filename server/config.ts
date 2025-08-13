import path from 'path';
import dotenv from 'dotenv';
import { z } from 'zod';

// Load env from monorepo root with fallback to example files
const ROOT = path.resolve(process.cwd());
const MONO_ROOT = path.resolve(ROOT, '..');

function loadDotEnvForCurrentEnv(nodeEnvOverride?: string) {
  const nodeEnv = nodeEnvOverride ?? (process.env.NODE_ENV === 'production' ? 'production' : (process.env.NODE_ENV || 'development'));
  if (process.env.SKIP_DOTENV === 'true') {
    return;
  }
  const preferredEnv = nodeEnv === 'production' ? '.env.prod' : '.env.dev';
  dotenv.config({ path: path.join(MONO_ROOT, preferredEnv) });
  // Only load example fallback in non-production to avoid masking missing secrets
  if (nodeEnv !== 'production') {
    const fallbackEnv = 'env.dev.example';
    dotenv.config({ path: path.join(MONO_ROOT, fallbackEnv) });
  }
}
loadDotEnvForCurrentEnv();

function computeDatabaseUrl(nodeEnv: string): string {
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.trim()) return envUrl;
  if (nodeEnv !== 'production') return 'postgres://lens:lens@localhost:5432/lensfinder';
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
  loadDotEnvForCurrentEnv(nodeEnvOverride);
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


