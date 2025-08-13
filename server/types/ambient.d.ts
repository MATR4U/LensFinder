declare module 'compression' {
  import type { RequestHandler } from 'express';
  const compression: () => RequestHandler;
  export default compression;
}

declare module 'graphql-depth-limit' {
  import type { ValidationRule } from 'graphql';
  export default function depthLimit(maxDepth: number): ValidationRule;
}

declare module 'graphql-query-complexity' {
  import type { ValidationRule } from 'graphql';
  export function createComplexityLimitRule(maxComplexity: number, options?: { onCost?: (cost: number) => void }): ValidationRule;
}


