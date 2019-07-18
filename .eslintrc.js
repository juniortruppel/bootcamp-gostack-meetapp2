module.exports = {
  env: {
    es6: true,
    node: true,
  },
  extends: ['airbnb-base', 'prettier'],
  plugins: ['prettier'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module',
  },
  rules: {
    'prettier/prettier': 'error', //Cria a regra pra q quando o prettier idenficar erros, ele retornar error
    'class-methods-use-this': 'off', //Permite nomear os métodos das classes sem o this
    'no-param-reassign': 'off', //Permite receber e alterar parâmetros
    'camelcase': 'off', //Desabilita obrigatoriedade do camelcase
    'no-unused-vars': ['error', { argsIgnorePattern: 'next' }], //Permite a criação da variável "next" que não vai utilizá-la
  }
};
