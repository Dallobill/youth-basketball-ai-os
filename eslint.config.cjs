module.exports = [
  {
    ignores: ['node_modules/**', 'frontend/node_modules/**']
  },
  {
    files: ['src/**/*.js', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        process: 'readonly',
        console: 'readonly',
        module: 'readonly',
        require: 'readonly'
      }
    }
  },
  {
    files: ['frontend/src/**/*.js', 'frontend/src/**/*.jsx'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        fetch: 'readonly',
        console: 'readonly',
        window: 'readonly',
        document: 'readonly'
      }
    }
  }
];
