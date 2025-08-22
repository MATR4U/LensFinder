"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OPS = void 0;
exports.cmpFactory = cmpFactory;
exports.softScore = softScore;
exports.OPS = ['isTrue', 'isFalse'];
function cmpFactory(op, value) {
    if (op === 'isTrue')
        return (x) => x === true;
    if (op === 'isFalse')
        return (x) => x === false;
    return () => false;
}
function softScore(op, x, value) {
    if (op === 'isTrue')
        return x === true ? 1 : 0;
    if (op === 'isFalse')
        return x === false ? 1 : 0;
    return 0;
}
