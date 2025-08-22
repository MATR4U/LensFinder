export type Vector = number[];
export interface AnnIndex<T = any> {
    add(id: number, vector: Vector, payload: T): void;
    build(): void;
    search(query: Vector, topK: number, filter?: (payload: T) => boolean): Array<{
        id: number;
        score: number;
        payload: T;
    }>;
}
