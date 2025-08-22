export function fromQueryParams(params, mapping) {
    const clauses = mapping.map(m => {
        const raw = params.get(m.param);
        const v = m.transformIn ? m.transformIn(raw) : raw;
        return { path: m.to, op: m.op, value: v, mode: m.mode ?? 'hard', weight: m.weight ?? 1 };
    });
    return { allOf: clauses };
}
export function toQueryParams(spec, mapping) {
    const search = new URLSearchParams();
    const clauses = (spec.allOf ?? []);
    mapping.forEach((m, i) => {
        const c = clauses[i];
        const v = m.transformOut ? m.transformOut(c?.value) : String(c?.value ?? '');
        if (v)
            search.set(m.param, v);
    });
    return search;
}
