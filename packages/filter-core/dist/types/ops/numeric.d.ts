export declare const OPS: readonly ["eq", "neq", "lt", "lte", "gt", "gte", "between", "inRange", "approx"];
export declare function cmpFactory(op: string, value: any): (x: any) => boolean;
export declare function softScore(op: string, x: any, value: any): number;
