"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankAsync = rankAsync;
exports.rank = rank;
const compiler_1 = require("../compile/compiler");
const heap_1 = require("./heap");
const sort_1 = require("./sort");
function reduceScores(parts, reducer) {
    if (!reducer || reducer === 'sum' || reducer === 'weightedSum')
        return parts.reduce((a, b) => a + b, 0);
    if (reducer === 'min')
        return parts.reduce((a, b) => Math.min(a, b), Number.POSITIVE_INFINITY);
    if (reducer === 'max')
        return parts.reduce((a, b) => Math.max(a, b), Number.NEGATIVE_INFINITY);
    if (typeof reducer === 'function')
        return reducer(parts);
    return parts.reduce((a, b) => a + b, 0);
}
async function rankAsync(iter, execOrSpec, options = {}) {
    const exec = execOrSpec.test ? execOrSpec : (0, compiler_1.compile)(execOrSpec);
    const topK = typeof options.topK === 'number' && options.topK > 0 ? new heap_1.TopK(options.topK) : undefined;
    const res = [];
    for await (const item of iter) {
        if (!exec.test(item))
            continue;
        const details = exec.score(item);
        const score = reduceScores(details.parts, options.scoreReducer);
        if (topK)
            topK.push(score, item);
        else
            res.push({ item, score, details });
    }
    const out = topK ? topK.values().map(v => ({ item: v.item, score: v.score, details: { total: v.score, parts: [] } })) : res.sort((a, b) => b.score - a.score);
    const limited = typeof options.limit === 'number' ? out.slice(options.offset ?? 0, (options.offset ?? 0) + options.limit) : out;
    const items = limited.map(x => x.item);
    const tb = options.tieBreakers?.length ? (0, sort_1.tieBreak)(items, options.tieBreakers) : items;
    const map = new Map(items.map((it, i) => [it, limited[i].score]));
    return tb.map(it => ({ item: it, score: map.get(it), details: { total: map.get(it), parts: [] } }));
}
function rank(data, execOrSpec, options = {}) {
    if (Symbol.asyncIterator in data)
        return rankAsync(data, execOrSpec, options);
    const exec = execOrSpec.test ? execOrSpec : (0, compiler_1.compile)(execOrSpec);
    const res = [];
    const arr = data;
    for (const item of arr) {
        if (!exec.test(item))
            continue;
        const details = exec.score(item);
        const score = reduceScores(details.parts, options.scoreReducer);
        res.push({ item, score, details });
    }
    res.sort((a, b) => b.score - a.score);
    const topApplied = typeof options.topK === 'number' && options.topK > 0 ? res.slice(0, options.topK) : res;
    const sliced = typeof options.limit === 'number'
        ? topApplied.slice(options.offset ?? 0, (options.offset ?? 0) + options.limit)
        : topApplied;
    const items = sliced.map(x => x.item);
    const tb = options.tieBreakers?.length ? (0, sort_1.tieBreak)(items, options.tieBreakers) : items;
    const map = new Map(items.map((it, i) => [it, sliced[i].score]));
    return tb.map(it => ({ item: it, score: map.get(it), details: { total: map.get(it), parts: [] } }));
}
