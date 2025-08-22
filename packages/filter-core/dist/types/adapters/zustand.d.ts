import { FilterSpec } from '../types';
export type MappingEntry = {
    to: string;
    op: string;
    mode?: 'hard' | 'soft';
    transform?: (v: any) => any;
    weight?: number;
};
export type Mapping = {
    [storePath: string]: MappingEntry;
};
export declare function fromStore(state: unknown, mapping: Mapping): FilterSpec;
