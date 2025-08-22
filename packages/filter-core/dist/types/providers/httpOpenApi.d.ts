import { DatasetSchema, FilterSpec } from '../types';
export declare function fetchPaged(urlBuilder: (page: number) => string, fetchImpl?: typeof fetch): AsyncGenerator<any>;
export declare function schemaToDataset(openapi: any, path: string): DatasetSchema;
export declare function paramsToSpec(openapi: any, path: string, params: URLSearchParams): FilterSpec;
