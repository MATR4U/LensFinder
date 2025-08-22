export type Path = string;
export type PrimitiveType = 'number' | 'integer' | 'string' | 'boolean';
export type ComplexType = 'enum' | 'array' | 'object' | 'vector';
export type FieldType = PrimitiveType | ComplexType;
export type DatasetField = {
    name: string;
    type: FieldType;
    enum?: string[] | number[];
    min?: number;
    max?: number;
    nullable?: boolean;
    items?: DatasetField;
    fields?: DatasetField[];
    dims?: number;
};
export type DatasetSchema = {
    fields: DatasetField[];
};
export type NumericOp = 'eq' | 'neq' | 'lt' | 'lte' | 'gt' | 'gte' | 'between' | 'inRange' | 'approx';
export type StringOp = 'eq' | 'neq' | 'includes' | 'startsWith' | 'endsWith' | 'regex';
export type ArrayOp = 'in' | 'notIn' | 'arrayContains' | 'arrayIntersects';
export type BooleanOp = 'isTrue' | 'isFalse';
export type VectorOp = 'cosineSimGte' | 'dotGte' | 'l2DistLte';
export type Operator = NumericOp | StringOp | ArrayOp | BooleanOp | VectorOp;
export type Clause = {
    path: Path;
    op: Operator;
    value: unknown;
    mode?: 'hard' | 'soft';
    weight?: number;
    missing?: 'exclude' | 'ignore' | 'coerceDefault';
};
export type FilterSpec = {
    allOf?: (Clause | FilterSpec)[];
    anyOf?: (Clause | FilterSpec)[];
    not?: Clause | FilterSpec;
};
export type RankReducer = 'sum' | 'weightedSum' | 'min' | 'max';
export type TieBreaker = {
    path: Path;
    dir: 'asc' | 'desc';
};
export type RankOptions = {
    scoreReducer?: RankReducer | ((scores: number[]) => number);
    tieBreakers?: TieBreaker[];
    topK?: number;
    limit?: number;
    offset?: number;
};
export type Executable = {
    test: (item: unknown) => boolean;
    score: (item: unknown) => {
        total: number;
        parts: number[];
    };
    clauses: Clause[];
};
export type Explanation = {
    pass: boolean;
    parts: Array<{
        clause: Clause;
        pass: boolean;
        contribution: number;
    }>;
    total: number;
};
export type ValidationError = {
    message: string;
    at?: string;
};
