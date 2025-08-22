export class TopK<T> {
  private data: Array<{ s: number; v: T }> = [];
  constructor(private k: number) {}
  push(score: number, value: T) {
    if (this.data.length < this.k) {
      this.data.push({ s: score, v: value });
      this.data.sort((a, b) => a.s - b.s);
      return;
    }
    if (score <= this.data[0].s) return;
    this.data[0] = { s: score, v: value };
    this.data.sort((a, b) => a.s - b.s);
  }
  values(): Array<{ score: number; item: T }> {
    return this.data.slice().sort((a, b) => b.s - a.s).map(x => ({ score: x.s, item: x.v }));
  }
}
