import { writeFileSync } from 'fs';
import path from 'path';
import { printSchema, graphql, getIntrospectionQuery } from 'graphql';
import { schema } from '../graphql.js';

async function main() {
  const root = process.cwd();
  const sdlPath = path.join(root, 'schema.graphql');
  const jsonPath = path.join(root, 'schema.json');

  const sdl = printSchema(schema);
  writeFileSync(sdlPath, sdl, 'utf-8');

  const introspection = await graphql({ schema, source: getIntrospectionQuery() });
  writeFileSync(jsonPath, JSON.stringify(introspection, null, 2), 'utf-8');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


