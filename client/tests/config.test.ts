import { describe, it, expect, vi } from 'vitest';

vi.stubGlobal('import.meta', { env: { VITE_API_BASE_URL: '', VITE_SEARCH_URL_BASE: 'https://www.google.com/search?q=' } });

describe('client config', () => {
  it('reads defaults', async () => {
    const { clientConfig } = await import('../src/config');
    expect(clientConfig.apiBaseUrl).toBe('');
    expect(clientConfig.searchUrlBase).toContain('google');
  });
});


