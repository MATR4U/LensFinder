import { describe, it, expect } from 'vitest';
import { HNSWIndex } from '../src/ann/hnsw';
describe('ANN HNSWIndex', () => {
    it('returns nearest by cosine', () => {
        const idx = new HNSWIndex();
        idx.add(1, [1, 0], { id: 1 });
        idx.add(2, [0, 1], { id: 2 });
        idx.add(3, [0.9, 0.1], { id: 3 });
        idx.build();
        const res = idx.search([1, 0], 2);
        expect(res[0].id).toBe(1);
        expect(res.length).toBe(2);
    });
});
