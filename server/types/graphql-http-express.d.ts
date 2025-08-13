declare module 'graphql-http/lib/use/express' {
  import type { RequestHandler } from 'express';
  import type { GraphQLSchema } from 'graphql';

  export type CreateHandlerOptions = {
    schema: GraphQLSchema;
  } & Record<string, unknown>;

  export function createHandler(options: CreateHandlerOptions): RequestHandler;
}


