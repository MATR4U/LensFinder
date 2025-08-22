import { makeGetter } from '../compile/accessors';
export function tieBreak(items, tieBreakers = []) {
    if (!tieBreakers.length)
        return items;
    const getters = tieBreakers.map(tb => ({ tb, get: makeGetter(tb.path) }));
    return items.slice().sort((a, b) => {
        for (const { tb, get } of getters) {
            const va = get(a);
            const vb = get(b);
            if (va === vb)
                continue;
            if (tb.dir === 'asc')
                return va < vb ? -1 : 1;
            return va > vb ? -1 : 1;
        }
        return 0;
    });
}
