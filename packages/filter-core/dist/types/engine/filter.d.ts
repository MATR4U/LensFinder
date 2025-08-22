import { Executable, FilterSpec } from '../types';
export declare function filterAsync<T>(iter: AsyncIterable<T>, execOrSpec: Executable | FilterSpec): AsyncGenerator<T>;
export declare function filter<T>(data: T[] | AsyncIterable<T>, execOrSpec: Executable | FilterSpec): T[] | AsyncGenerator<T>;
