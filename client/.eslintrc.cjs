module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: { ecmaVersion: 'latest', sourceType: 'module', project: false },
  plugins: ['@typescript-eslint', 'import'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  settings: {
    'import/resolver': {
      typescript: {
        project: __dirname + '/tsconfig.json',
      },
      alias: {
        map: [
          ['@types', './src/types'],
          ['@lib', './src/lib'],
          ['@stores', './src/stores'],
          ['@hooks', './src/hooks'],
          ['@flow', './src/components/flow'],
          ['@ui', './src/components/ui'],
          ['@context', './src/context'],
          ['@graphql', './src/graphql'],
          ['@pages', './src/pages'],
        ],
        extensions: ['.ts', '.tsx', '.js', '.jsx']
      }
    }
  },
  rules: {
    // Enforce architectural boundaries (warn for now; tighten after migration)
    'import/no-restricted-paths': ['warn', {
      zones: [
        { target: './src/components/ui', from: './src/hooks', message: 'UI must not import hooks.' },
        { target: './src/components/ui', from: './src/stores', message: 'UI must not import stores.' },
        { target: './src/components/ui', from: './src/lib', message: 'UI must not import domain logic directly.' },
        { target: './src/components/flow', from: './src/stores', message: 'Flow should consume stores via hooks.' },
        { target: './src/hooks', from: './src/components', message: 'Hooks must not import components.' },
      ]
    }],
  }
};


