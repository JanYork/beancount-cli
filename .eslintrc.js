module.exports = {
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
    ],
    plugins: ['@typescript-eslint'],
    parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module',
    },
    rules: {
        // 禁用强制换行相关规则
        'max-len': 'off',
        'object-curly-newline': 'off',
        'function-paren-newline': 'off',
        'function-call-argument-newline': 'off',

        // TypeScript 相关规则
        '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
        'no-unused-vars': 'off', // 使用TypeScript版本

        // 代码质量规则
        'no-console': 'off', // CLI工具需要console输出
        'prefer-const': 'error',
        'no-var': 'error',

        // 代码风格规则（与Prettier配合）
        'semi': 'off',
        'quotes': 'off',
        'comma-dangle': 'off',
        'indent': 'off',
    },
    env: {
        node: true,
        es6: true,
        jest: true,
    },
    ignorePatterns: [
        'dist/',
        'node_modules/',
        '*.js',
        '!.eslintrc.js',
        '!jest.config.js',
    ],
};
