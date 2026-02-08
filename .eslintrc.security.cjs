/**
 * @fileoverview ESLint security configuration
 * @description Security-focused ESLint rules to detect potential vulnerabilities
 * and security issues in the codebase.
 */

module.exports = {
    root: true,
    env: { browser: true, es2020: true },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:react-hooks/recommended',
    ],
    ignorePatterns: ['dist', '.eslintrc.cjs', '.eslintrc.security.cjs', 'amplify'],
    parser: '@typescript-eslint/parser',
    plugins: [
        'react-refresh',
        'security',
        'no-secrets',
    ],
    rules: {
        'react-refresh/only-export-components': [
            'warn',
            { allowConstantExport: true },
        ],
        '@typescript-eslint/no-explicit-any': 'warn',

        // Security Rules
        'security/detect-object-injection': 'warn',
        'security/detect-non-literal-regexp': 'warn',
        'security/detect-unsafe-regex': 'error',
        'security/detect-buffer-noassert': 'error',
        'security/detect-child-process': 'error',
        'security/detect-disable-mustache-escape': 'error',
        'security/detect-eval-with-expression': 'error',
        'security/detect-no-csrf-before-method-override': 'error',
        'security/detect-non-literal-fs-filename': 'warn',
        'security/detect-non-literal-require': 'warn',
        'security/detect-possible-timing-attacks': 'warn',
        'security/detect-pseudoRandomBytes': 'error',

        // Secret Detection
        'no-secrets/no-secrets': ['error', {
            'tolerance': 4.5,
            'ignoreContent': ['^REACT_APP_', '^VITE_'],
            'ignoreIdentifiers': ['className', 'testId', 'ariaLabel'],
        }],

        // Prevent dangerous patterns
        'no-eval': 'error',
        'no-implied-eval': 'error',
        'no-new-func': 'error',
        'no-script-url': 'error',
    },
    overrides: [
        {
            files: ['**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts', '**/*.spec.tsx'],
            rules: {
                'security/detect-object-injection': 'off',
                'security/detect-non-literal-fs-filename': 'off',
            },
        },
    ],
}
