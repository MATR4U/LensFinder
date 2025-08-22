function dot(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++)
        s += a[i] * b[i];
    return s;
}
function norm(a) {
    let s = 0;
    for (let i = 0; i < a.length; i++)
        s += a[i] * a[i];
    return Math.sqrt(s);
}
function cosineSim(a, b) {
    const na = norm(a);
    const nb = norm(b);
    if (na === 0 || nb === 0)
        return 0;
    return dot(a, b) / (na * nb);
}
export class HNSWIndex {
    constructor() {
        this.data = [];
    }
    add(id, vector, payload) {
        this.data.push({ id, vec: vector, payload });
    }
    build() { }
    search(query, topK, filter) {
        const scored = this.data
            .filter(d => (filter ? filter(d.payload) : true))
            .map(d => ({ id: d.id, score: cosineSim(query, d.vec), payload: d.payload }))
            .sort((a, b) => b.score - a.score)
            .slice(0, topK);
        return scored;
    }
}
