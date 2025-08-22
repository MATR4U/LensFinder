function get(obj, path) {
    const parts = path.split('.');
    let cur = obj;
    for (const p of parts) {
        if (cur == null)
            return undefined;
        cur = cur[p];
    }
    return cur;
}
export function fromStore(state, mapping) {
    const clauses = Object.entries(mapping).map(([from, meta]) => {
        const v = meta.transform ? meta.transform(get(state, from)) : get(state, from);
        return { path: meta.to, op: meta.op, value: v, mode: meta.mode ?? 'hard', weight: meta.weight ?? 1 };
    });
    return { allOf: clauses };
}
