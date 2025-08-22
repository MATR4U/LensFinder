"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPS = void 0;
exports.cmpFactory = cmpFactory;
exports.softScore = softScore;
exports.OPS = ['in', 'notIn', 'arrayContains', 'arrayIntersects'];
function cmpFactory(op, value) {
    if (op === 'in') {
        const set = new Set(Array.isArray(value) ? value : [value]);
        return (x) => set.has(x);
    }
    if (op === 'notIn') {
        const set = new Set(Array.isArray(value) ? value : [value]);
        return (x) => !set.has(x);
    }
    if (op === 'arrayContains') {
        return (x) => Array.isArray(x) && x.includes(value);
    }
    if (op === 'arrayIntersects') {
        const set = new Set(Array.isArray(value) ? value : [value]);
        return (x) => Array.isArray(x) && x.some(v => set.has(v));
    }
    return () => false;
}
function softScore(op, x, value) {
    if (!Array.isArray(x))
        return 0;
    if (op === 'arrayIntersects') {
        const v = Array.isArray(value) ? value : [value];
        const inter = x.filter(it => v.includes(it)).length;
        return inter > 0 ? 1 : 0;
    }
    if (op === 'arrayContains')
        return x.includes(value) ? 1 : 0;
    return 0;
}
