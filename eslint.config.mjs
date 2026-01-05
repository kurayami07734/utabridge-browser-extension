// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    {
        ignores: ['.output/**', '.wxt/**', 'node_modules/**'],
    },
    {
        files: ['**/*.{ts,tsx,js,jsx,mjs}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: {
                ...globals.browser,
                ...globals.webextensions,
            },
            parserOptions: {
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
        plugins: {
            react: react,
            'react-hooks': reactHooks,
        },
        rules: {
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/no-require-imports': 'off',
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            'react/react-in-jsx-scope': 'off', // Not needed for React 17+ / WXT
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
    {
        files: ['tests/**'],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.webextensions,
                describe: 'readonly',
                it: 'readonly',
                expect: 'readonly',
                vi: 'readonly',
                beforeEach: 'readonly',
                afterEach: 'readonly',
            },
        },
    },
]);
