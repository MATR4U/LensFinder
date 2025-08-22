"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.explain = explain;
function explain(item, exec) {
    const parts = exec.clauses.map((c, idx) => {
        const isSoft = (c.mode ?? 'hard') === 'soft';
        const res = exec.score(item);
        const contribution = isSoft ? res.parts[idx] : 0;
        const pass = isSoft ? contribution > 0 : exec.test(item);
        return { clause: c, pass, contribution };
    });
    const total = parts.reduce((a, b) => a + b.contribution, 0);
    const pass = exec.test(item);
    return { pass, parts, total };
}
