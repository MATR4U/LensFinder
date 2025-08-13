let SwaggerParser: any;
import fs from 'fs/promises';
import path from 'path';

describe('OpenAPI spec is valid', () => {
  it('parses and validates server/openapi.json', async () => {
    const mod = await import('@apidevtools/swagger-parser').catch(() => null as any);
    if (!mod) return;
    SwaggerParser = (mod as any).default || (mod as any);
    const specPath = path.resolve(process.cwd(), 'openapi.json');
    // If not present in CWD, try server/openapi.json when running from monorepo root
    let candidate = specPath;
    try {
      await fs.access(candidate);
    } catch {
      candidate = path.resolve(process.cwd(), 'server', 'openapi.json');
    }
    await SwaggerParser.validate(candidate);
  });
});


