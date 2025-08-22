import { vi } from 'vitest';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

process.env.VITEST = '1';
process.env.NODE_ENV = 'test';
process.env.API_KEY = '';
process.env.FILE_REPO_FIXTURES_DIR = path.resolve(__dirname, 'fixtures');

vi.mock('../db/provider.js', async () => await import('../db/fileRepo.js'));
vi.mock('./db/provider.js', async () => await import('../db/fileRepo.js'));

vi.mock('../db/pg.js', () => ({
  getPool: () => ({
    query: async (sql?: string) => {
      if (!sql || /select\s+1/i.test(String(sql || ''))) return { rows: [{ '?column?': 1 }] } as any;
      return { rows: [] } as any;
    }
  })
}));
vi.mock('./db/pg.js', () => ({
  getPool: () => ({
    query: async (sql?: string) => {
      if (!sql || /select\s+1/i.test(String(sql || ''))) return { rows: [{ '?column?': 1 }] } as any;
      return { rows: [] } as any;
    }
  })
}));
