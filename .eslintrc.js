module.exports = {
  // Specifies the environments where your code will run
  env: {
    browser: true, // Browser global variables
    es2021: true,  // Adds all ECMAScript 2021 globals and automatically sets ecmaVersion to 12
    node: true,    // Node.js global variables and scoping
  },
  // A set of recommended rules to extend from
  extends: [
    'eslint:recommended',
    'plugin:react/recommended', // Uses the recommended rules from @eslint-plugin-react
    'plugin:@typescript-eslint/recommended', // Uses the recommended rules from @typescript-eslint/eslint-plugin
    'plugin:react-hooks/recommended', // Enforces rules of Hooks
  ],
  // The parser that allows ESLint to understand TypeScript syntax
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true, // Allows for the parsing of JSX
    },
    ecmaVersion: 'latest', // Allows for the parsing of modern ECMAScript features
    sourceType: 'module', // Allows for the use of imports
  },
  // Plugins that provide additional rules
  plugins: [
    'react',
    '@typescript-eslint',
  ],
  // Custom rules can be added here
  rules: {
    // Suppress errors for missing 'import React' in files for React 17+
    'react/react-in-jsx-scope': 'off',
    // Allow JSX in .tsx files
    'react/jsx-filename-extension': [1, { 'extensions': ['.js', '.jsx', '.ts', '.tsx'] }],
    // Add any other custom rules here
  },
  settings: {
    react: {
      // Tells eslint-plugin-react to automatically detect the version of React to use
      version: 'detect',
    },
  },
};