export declare class TopK<T> {
    private k;
    private data;
    constructor(k: number);
    push(score: number, value: T): void;
    values(): Array<{
        score: number;
        item: T;
    }>;
}
