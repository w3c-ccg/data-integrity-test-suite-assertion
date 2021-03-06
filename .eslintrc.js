module.exports = {
  env: {
    node: true,
    mocha: true
  },
  extends: [
    'eslint-config-digitalbazaar',
    'eslint-config-digitalbazaar/jsdoc'
  ],
  rules: {
    'jsdoc/check-examples': 0
  }
};
