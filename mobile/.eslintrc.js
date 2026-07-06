module.exports = {
  root: true,
  extends: ['@react-native', 'prettier'],
  plugins: ['react', 'react-native'],
  rules: {
    'react-native/no-inline-styles': 'warn',
    'no-console': 'warn',
  },
};
