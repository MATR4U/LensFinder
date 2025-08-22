export const OPS = ['eq', 'neq', 'lt', 'lte', 'gt', 'gte', 'between', 'inRange', 'approx'];
export function cmpFactory(op, value) {
    if (op === 'eq')
        return (x) => x === value;
    if (op === 'neq')
        return (x) => x !== value;
    if (op === 'lt')
        return (x) => typeof x === 'number' && x < value;
    if (op === 'lte')
        return (x) => typeof x === 'number' && x <= value;
    if (op === 'gt')
        return (x) => typeof x === 'number' && x > value;
    if (op === 'gte')
        return (x) => typeof x === 'number' && x >= value;
    if (op === 'between') {
        const [a, b] = value;
        return (x) => typeof x === 'number' && x >= a && x <= b;
    }
    if (op === 'inRange') {
        const [a, b] = value;
        return (x) => typeof x === 'number' && x >= a && x <= b;
    }
    if (op === 'approx') {
        const eps = typeof value === 'number' ? 1e-6 : (value?.eps ?? 1e-3);
        const target = typeof value === 'number' ? value : value?.target;
        return (x) => typeof x === 'number' && Math.abs(x - target) <= eps;
    }
    return () => false;
}
export function softScore(op, x, value) {
    if (typeof x !== 'number')
        return 0;
    if (op === 'eq')
        return x === value ? 1 : 0;
    if (op === 'lte')
        return x <= value ? 1 : 1 / (1 + (x - value));
    if (op === 'gte')
        return x >= value ? 1 : 1 / (1 + (value - x));
    if (op === 'between' || op === 'inRange') {
        const [a, b] = value;
        if (x >= a && x <= b)
            return 1;
        const d = x < a ? a - x : x - b;
        return 1 / (1 + d);
    }
    return 0;
}
