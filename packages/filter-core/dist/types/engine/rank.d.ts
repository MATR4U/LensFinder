import { Executable, FilterSpec, RankOptions } from '../types';
export declare function rankAsync<T>(iter: AsyncIterable<T>, execOrSpec: Executable | FilterSpec, options?: RankOptions): Promise<{
    item: T;
    score: number;
    details: {
        total: number;
        parts: number[];
    };
}[]>;
export declare function rank<T>(data: T[] | AsyncIterable<T>, execOrSpec: Executable | FilterSpec, options?: RankOptions): Promise<{
    item: T;
    score: number;
    details: {
        total: number;
        parts: number[];
    };
}[]> | {
    item: T;
    score: number;
    details: {
        total: number;
        parts: number[];
    };
}[];
