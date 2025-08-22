export const OPS = ['isTrue', 'isFalse'];
export function cmpFactory(op, value) {
    if (op === 'isTrue')
        return (x) => x === true;
    if (op === 'isFalse')
        return (x) => x === false;
    return () => false;
}
export function softScore(op, x, value) {
    if (op === 'isTrue')
        return x === true ? 1 : 0;
    if (op === 'isFalse')
        return x === false ? 1 : 0;
    return 0;
}
