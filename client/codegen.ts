import type { CodegenConfig } from '@graphql-codegen/cli';

const schemaSource = process.env.VITE_API_BASE_URL
  ? `${process.env.VITE_API_BASE_URL}/graphql`
  : '../server/schema.graphql';

const config: CodegenConfig = {
  require: [],
  schema: schemaSource,
  documents: 'src/**/*.graphql',
  ignoreNoDocuments: true,
  generates: {
    'src/types/graphql/': {
      preset: 'client',
      presetConfig: {
        gqlTagName: 'gql'
      }
    }
  }
};

export default config;


