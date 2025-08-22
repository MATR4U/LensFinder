export const OPS = ['eq', 'neq', 'includes', 'startsWith', 'endsWith', 'regex'];
export function cmpFactory(op, value) {
    const v = String(value ?? '');
    if (op === 'eq')
        return (x) => String(x ?? '') === v;
    if (op === 'neq')
        return (x) => String(x ?? '') !== v;
    if (op === 'includes')
        return (x) => String(x ?? '').includes(v);
    if (op === 'startsWith')
        return (x) => String(x ?? '').startsWith(v);
    if (op === 'endsWith')
        return (x) => String(x ?? '').endsWith(v);
    if (op === 'regex') {
        const r = new RegExp(v);
        return (x) => r.test(String(x ?? ''));
    }
    return () => false;
}
export function softScore(op, x, value) {
    if (op === 'eq')
        return String(x ?? '') === String(value ?? '') ? 1 : 0;
    if (op === 'includes')
        return String(x ?? '').includes(String(value ?? '')) ? 1 : 0;
    return 0;
}
