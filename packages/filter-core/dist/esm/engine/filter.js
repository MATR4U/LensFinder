import { compile } from '../compile/compiler';
export async function* filterAsync(iter, execOrSpec) {
    const exec = execOrSpec.test ? execOrSpec : compile(execOrSpec);
    for await (const item of iter) {
        if (exec.test(item))
            yield item;
    }
}
export function filter(data, execOrSpec) {
    const exec = execOrSpec.test ? execOrSpec : compile(execOrSpec);
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
