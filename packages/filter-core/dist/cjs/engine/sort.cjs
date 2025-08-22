"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tieBreak = tieBreak;
const accessors_1 = require("../compile/accessors");
function tieBreak(items, tieBreakers = []) {
    if (!tieBreakers.length)
        return items;
    const getters = tieBreakers.map(tb => ({ tb, get: (0, accessors_1.makeGetter)(tb.path) }));
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
