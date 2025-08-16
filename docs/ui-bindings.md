### Schema-based UI bindings to the store

Use `useFilterBindings(schema)` to declaratively bind UI components to the global store without repeating selector boilerplate.

Example:

```ts
import { useFilterBindings, PRO_REQ_BINDINGS } from '../hooks/useStoreBindings';

const {
  brand, setBrand,
  lensType, setLensType,
  coverage, setCoverage,
} = useFilterBindings(PRO_REQ_BINDINGS);
```

- Define per-screen schemas in `useStoreBindings.ts` using `as const satisfies readonly BindingSpec[]`.
- Support aliasing via `as` (value) and `setterAs` (setter) to adapt store names to UI prop names.
- Setter names are inferred by convention if not provided: `set${Capitalize<Key>}`.
- The hook is strongly typed; avoid `as any`.

Add new schemas next to existing ones (e.g., `BUILD_CAPS_BINDINGS`, `REQ_STAGE_BINDINGS`).


