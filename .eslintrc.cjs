module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'prettier',
  ],
  parserOptions: {
    project: './tsconfig.json'
  },
  ignorePatterns: ['.eslintrc.cjs'],
  rules: {
    "class-methods-use-this": "off",
    "@typescript-eslint/lines-between-class-members": "off",
    "guard-for-in": "off",
    "import/prefer-default-export": "off"
  }
};
