import { describe, it, expect } from 'vitest';
import { schemaToDataset, paramsToSpec } from '../src/providers/httpOpenApi';

describe('OpenAPI helpers', () => {
  it('exported helpers exist and handle empty input', () => {
    const ds = schemaToDataset({}, '/things');
    expect(ds).toBeTruthy();
    const spec = paramsToSpec({}, '/things', new URLSearchParams());
    expect(spec).toBeTruthy();
  });
});
