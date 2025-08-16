// Flat config for ESLint v9+
// Covers TS React project with boundary rules

const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const importPlugin = require('eslint-plugin-import');
const reactHooksPlugin = require('eslint-plugin-react-hooks');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      // Exclude generated and declaration files
      'src/**/*.d.ts',
      'src/types/**',
      'src/types/**/*.d.ts',
      'src/types/graphql/**',
    ],
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { JSX: true },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      import: importPlugin,
      'react-hooks': reactHooksPlugin,
      
    },
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
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
        },
      },
    },
    rules: {
      ...tsPlugin.configs['recommended'].rules,
      // React hooks
      'react-hooks/rules-of-hooks': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      // Prefer schema-based bindings over direct store usage in components
      'no-restricted-imports': ['warn', {
        patterns: [
          {
            group: ['../stores/**', '../../stores/**', '../../../stores/**', '@stores/**'],
            importNames: ['useFilterStore'],
            message: 'Prefer useFilterBindings with a schema (see docs/ui-bindings.md).'
          }
        ]
      }],
      // Architectural boundaries (warn for now)
      'import/no-restricted-paths': ['warn', {
        zones: [
          { target: './src/components/ui', from: './src/hooks', message: 'UI must not import hooks.' },
          { target: './src/components/ui', from: './src/stores', message: 'UI must not import stores.' },
          { target: './src/components/ui', from: './src/lib', message: 'UI must not import domain logic directly.' },
          { target: './src/components/flow', from: './src/stores', message: 'Flow should consume stores via hooks.' },
          { target: './src/hooks', from: './src/components', message: 'Hooks must not import components.' },
        ],
      }],
      // Noise reduction (warn level for incremental cleanup)
      // Use TS ESLint rule to flag unused vars and imports (import specifiers)
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
];


