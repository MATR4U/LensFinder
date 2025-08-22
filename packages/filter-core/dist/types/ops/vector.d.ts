export declare const OPS: readonly ["cosineSimGte", "dotGte", "l2DistLte"];
export declare function cosineSim(a: number[], b: number[]): number;
export declare function l2Dist(a: number[], b: number[]): number;
export declare function cmpFactory(op: string, value: any): (x: any) => boolean;
export declare function softScore(op: string, x: any, value: any): number;
