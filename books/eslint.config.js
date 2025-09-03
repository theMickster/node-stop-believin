// eslint-disable-next-line @typescript-eslint/no-require-imports
const tseslint = require('typescript-eslint');
const importPlugin = require('eslint-plugin-import');

module.exports = [
  // Ignore patterns
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      '*.js',
      '!eslint.config.js',
    ],
  },

  // Base configuration for TypeScript files
  ...tseslint.configs.recommended,

  {
    files: ['**/*.ts'],
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      // Prevent 'any' type usage
      '@typescript-eslint/no-explicit-any': 'error',

      // Prevent unsafe operations with 'any'
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',

      // Require type annotations for better safety
      '@typescript-eslint/explicit-function-return-type': ['warn', {
        allowExpressions: true,
        allowTypedFunctionExpressions: true,
      }],

      // Prevent unused variables (catch all cases)
      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],

      // Import ordering rules
      'import/order': ['error', {
        'groups': [
          'builtin',   // Node.js built-in modules
          'external',  // npm packages
          'internal',  // Your @libs, @features, etc.
          'parent',    // ../
          'sibling',   // ./
          'index',     // ./index
        ],
        'pathGroups': [
          {
            pattern: '@libs/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@middleware/**',
            group: 'internal',
            position: 'before',
          },
          {
            pattern: '@data/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '@features/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '../../../config/**',
            group: 'internal',
            position: 'before',
          },
        ],
        'pathGroupsExcludedImportTypes': ['builtin'],
        'newlines-between': 'always',
        'alphabetize': {
          order: 'asc',
          caseInsensitive: true,
        },
      }],
    },
  },

  // Test files - more relaxed rules
  {
    files: ['**/*.test.ts', '**/*.spec.ts'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  }
];
