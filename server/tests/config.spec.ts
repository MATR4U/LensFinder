import { describe, it, expect, vi } from 'vitest';

describe('server/config', () => {
  it('provides defaults in development', async () => {
    const old = { ...process.env };
    process.env.NODE_ENV = 'development';
    delete process.env.DATABASE_URL;
    const { config } = await import('../config.js');
    expect(config.port).toBeTypeOf('number');
    expect(config.databaseUrl).toContain('postgres://');
    process.env = old;
  });

  it('throws in production when DATABASE_URL missing', async () => {
    const old = { ...process.env };
    process.env.NODE_ENV = 'production';
    process.env.SKIP_DOTENV = 'true';
    delete process.env.DATABASE_URL;
    vi.resetModules();
    await expect(import('../config.js')).rejects.toThrow(/DATABASE_URL/);
    process.env = old;
  });
});


