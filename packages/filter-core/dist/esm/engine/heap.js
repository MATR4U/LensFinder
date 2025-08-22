export class TopK {
    constructor(k) {
        this.k = k;
        this.data = [];
    }
    push(score, value) {
        if (this.data.length < this.k) {
            this.data.push({ s: score, v: value });
            this.data.sort((a, b) => a.s - b.s);
            return;
        }
        if (score <= this.data[0].s)
            return;
        this.data[0] = { s: score, v: value };
        this.data.sort((a, b) => a.s - b.s);
    }
    values() {
        return this.data.slice().sort((a, b) => b.s - a.s).map(x => ({ score: x.s, item: x.v }));
    }
}
