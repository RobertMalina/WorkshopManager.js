module.exports = {
  verbose: true,
  transform: {
    '^.+\\.js$': 'babel-jest',
  },
  // normalna konfiguracja
  // testMatch: ['**/tests/jest/**/*.[jt]s?(x)'],

  // tylko testy związane z pracą mgr
  testMatch: ['**/tests/jest/master-thesis/**/*.[jt]s?(x)'],
  // testMatch: ['**/tests/jest/master-thesis/tests.spec.js'], // pojedyńczy
};
