module.exports = [
  {
    ignores: [
      'node_modules/',
      'dist/',
      'docs/.vuepress/dist/',
      '*.min.js',
      '*.d.ts',
      'pnpm-lock.yaml',
      '*.log',
      '.env*',
    ],
  },
  {
    files: ['**/*.js', '**/*.ts', '**/*.vue'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        console: 'readonly',
        process: 'readonly',
        Buffer: 'readonly',
        __dirname: 'readonly',
        __filename: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly',
        global: 'readonly',
        window: 'readonly',
        document: 'readonly',
      },
    },
    rules: {
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'indent': ['error', 2],
      'quotes': ['error', 'single'],
      'semi': ['error', 'never'],
      'comma-dangle': ['error', 'always-multiline'],
    },
  },
  {
    files: ['docs/.vuepress/config.js'],
    rules: {
      'no-console': 'off',
    },
  },
]
