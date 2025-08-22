"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filterAsync = filterAsync;
exports.filter = filter;
const compiler_1 = require("../compile/compiler");
async function* filterAsync(iter, execOrSpec) {
    const exec = execOrSpec.test ? execOrSpec : (0, compiler_1.compile)(execOrSpec);
    for await (const item of iter) {
        if (exec.test(item))
            yield item;
    }
}
function filter(data, execOrSpec) {
    const exec = execOrSpec.test ? execOrSpec : (0, compiler_1.compile)(execOrSpec);
    if (Symbol.asyncIterator in data) {
        return filterAsync(data, exec);
    }
    const arr = data;
    const out = [];
    for (const item of arr) {
        if (exec.test(item))
            out.push(item);
    }
    return out;
}
