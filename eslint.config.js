import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  // Basic configuration
  {
    ignores: ['node_modules/**/*', '.next/**/*', '*.config.js', '*.config.ts'],
  },
  // TypeScript configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // TypeScript rules
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  // Next.js specific rules
  {
    files: ['**/*.tsx'],
    rules: {
      // Next.js specific rules will go here
    },
  },
  {
    // Apply to JS/JSX files
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // Basic rules
      'no-unused-vars': 'warn',
      'no-undef': 'error',
      'no-console': 'warn',
    },
  },
  {
    // Apply to TS/TSX files
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
        project: './tsconfig.json',
      },
    },
    plugins: {
      '@typescript-eslint': typescriptEslint,
    },
    rules: {
      // Disable base ESLint rules that conflict with TypeScript
      'no-unused-vars': 'off',
      'no-undef': 'off',

      // TypeScript-specific rules
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',

      // General rules
      'no-console': 'warn',
    },
  },
];

export default config;
