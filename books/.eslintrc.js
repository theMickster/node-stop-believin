module.exports = {
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    extends: [
      'eslint:recommended',
      'plugin:@typescript-eslint/recommended',
      'prettier',
    ],
    env: {
      node: true,
      es6: true,
    },
    rules: {
      // Prevent 'any' type usage
      '@typescript-eslint/no-explicit-any': 'error',

      // Prevent unsafe member access
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
    },
    overrides: [
      {
        // Allow some flexibility in test files
        files: ['**/*.test.ts', '**/*.spec.ts'],
        rules: {
          '@typescript-eslint/no-explicit-any': 'warn',
          '@typescript-eslint/no-unsafe-member-access': 'off',
          '@typescript-eslint/no-unsafe-assignment': 'off',
          '@typescript-eslint/explicit-function-return-type': 'off',
        },
      },
    ],
  };