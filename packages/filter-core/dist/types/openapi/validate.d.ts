import { FilterSpec, ValidationError } from '../types';
export declare function validateSpec(spec: FilterSpec): {
    ok: true;
} | {
    ok: false;
    errors: ValidationError[];
};
