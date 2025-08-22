export declare const OPS: readonly ["in", "notIn", "arrayContains", "arrayIntersects"];
export declare function cmpFactory(op: string, value: any): (x: any) => boolean;
export declare function softScore(op: string, x: any, value: any): number;
