import type { Request, Response } from 'express';
import { execute, parse, validate, getOperationAST, specifiedRules, GraphQLSchema } from 'graphql';

export function createGraphQLHandler(schema: GraphQLSchema) {
  return async function handler(req: Request, res: Response) {
    try {
      if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST');
        return res.status(405).type('application/problem+json').json({ type: 'about:blank', title: 'Method Not Allowed', status: 405 });
      }
      const { query, variables, operationName } = req.body || {};
      if (!query || typeof query !== 'string') {
        return res.status(400).type('application/problem+json').json({ type: 'about:blank', title: 'Bad Request', status: 400, detail: 'Missing query' });
      }
      const document = parse(query);
      let rules: any[] = [...specifiedRules];
      try {
        const depthModule: any = await import('graphql-depth-limit');
        const complexityModule: any = await import('graphql-query-complexity');
        const depthRule = (depthModule && (depthModule.default || depthModule))(10);
        const complexityRule = (complexityModule && complexityModule.createComplexityLimitRule)
          ? complexityModule.createComplexityLimitRule(2000, { onCost: () => {} })
          : null;
        rules = [...rules, depthRule, ...(complexityRule ? [complexityRule] : [])];
      } catch {}
      const validationErrors = validate(schema, document, rules as any);
      if (validationErrors.length > 0) {
        return res.status(400).type('application/problem+json').json({ type: 'about:blank', title: 'Bad Request', status: 400, detail: 'GraphQL validation failed' });
      }
      const operation = getOperationAST(document, operationName ?? null);
      if (!operation) {
        return res.status(400).type('application/problem+json').json({ type: 'about:blank', title: 'Bad Request', status: 400, detail: 'Unknown operation' });
      }
      const result = await execute({ schema, document, variableValues: variables || {}, operationName });
      const status = result.errors && result.errors.length > 0 ? 500 : 200;
      res.status(status).json(result);
    } catch (e: any) {
      res.status(500).type('application/problem+json').json({ type: 'about:blank', title: 'Internal Server Error', status: 500, detail: e?.message || 'Internal error' });
    }
  };
}


