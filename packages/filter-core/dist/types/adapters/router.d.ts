import { FilterSpec } from '../types';
export type QueryMappingEntry = {
    param: string;
    to: string;
    op: string;
    mode?: 'hard' | 'soft';
    transformIn?: (s: string | null) => any;
    transformOut?: (v: any) => string;
    weight?: number;
};
export type QueryMapping = QueryMappingEntry[];
export declare function fromQueryParams(params: URLSearchParams, mapping: QueryMapping): FilterSpec;
export declare function toQueryParams(spec: FilterSpec, mapping: QueryMapping): URLSearchParams;
