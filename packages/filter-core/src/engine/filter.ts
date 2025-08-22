import { Executable, FilterSpec } from '../types';
import { compile } from '../compile/compiler';

export async function* filterAsync<T>(iter: AsyncIterable<T>, execOrSpec: Executable | FilterSpec): AsyncGenerator<T> {
  const exec = (execOrSpec as any).test ? execOrSpec as Executable : compile(execOrSpec as FilterSpec);
  for await (const item of iter) {
    if (exec.test(item)) yield item;
  }
}

export function filter<T>(data: T[] | AsyncIterable<T>, execOrSpec: Executable | FilterSpec): T[] | AsyncGenerator<T> {
  const exec = (execOrSpec as any).test ? execOrSpec as Executable : compile(execOrSpec as FilterSpec);
  if (Symbol.asyncIterator in (data as any)) {
    return filterAsync(data as AsyncIterable<T>, exec);
  }
  const arr = data as T[];
  const out: T[] = [];
  for (const item of arr) {
    if (exec.test(item)) out.push(item);
  }
  return out;
}
