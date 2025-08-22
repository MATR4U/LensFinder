import { beforeAll, vi } from 'vitest';

beforeAll(() => {
  process.env.VITEST = '1';
  process.env.NODE_ENV = 'test';
  process.env.API_KEY = '';
  process.env.FILE_REPO_FIXTURES_DIR = `${process.cwd()}/server/tests/fixtures`;
});

vi.mock('../db/provider.js', async () => await import('../db/fileRepo.js'));

vi.mock('../db/pg.js', () => ({
  getPool: () => ({
    query: async (sql?: string) => {
      if (!sql || /select\s+1/i.test(String(sql || ''))) return { rows: [{ '?column?': 1 }] } as any;
      return { rows: [] } as any;
    }
  })
}));
