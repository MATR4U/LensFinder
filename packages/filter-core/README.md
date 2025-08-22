Filter Core

Exports
- Types: FilterSpec, RankOptions, DatasetSchema, Clause, Executable, Explanation
- API: compile, filter, rank, explain
- Adapters: fromStore, fromQueryParams, toQueryParams
- OpenAPI helpers: fetchPaged, schemaToDataset, paramsToSpec

Usage
import { compile, filter, rank } from '@lensfinder/filter-core';

const spec = { allOf: [{ path: 'price', op: 'lte', value: 1000, mode: 'hard' }, { path: 'weight', op: 'lte', value: 800, mode: 'soft', weight: 1 }] };
const exec = compile(spec);
const filtered = filter(items, exec);
const ranked = rank(items, exec, { topK: 10 });
