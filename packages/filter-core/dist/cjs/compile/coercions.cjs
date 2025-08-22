"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toNumber = toNumber;
exports.toStringVal = toStringVal;
exports.toBool = toBool;
function toNumber(v) {
    if (v == null)
        return undefined;
    if (typeof v === 'number')
        return v;
    const n = Number(v);
    return Number.isNaN(n) ? undefined : n;
}
function toStringVal(v) {
    if (v == null)
        return undefined;
    return String(v);
}
function toBool(v) {
    if (v == null)
        return undefined;
    if (typeof v === 'boolean')
        return v;
    if (v === 'true' || v === '1')
        return true;
    if (v === 'false' || v === '0')
        return false;
    return undefined;
}
