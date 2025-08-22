import { AnnIndex, Vector } from './ann.types';
export declare class HNSWIndex<T = any> implements AnnIndex<T> {
    private data;
    add(id: number, vector: Vector, payload: T): void;
    build(): void;
    search(query: Vector, topK: number, filter?: (payload: T) => boolean): {
        id: number;
        score: number;
        payload: T;
    }[];
}
