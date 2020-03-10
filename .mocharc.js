'use strict';

module.exports = {
  diff: true,
  extension: ['js'],
  opts: false,
  package: './package.json',
  reporter: 'spec',
  slow: 75,
  timeout: 2000,
  ui: 'bdd',
  //'watch-files': ['tests/mocha/**/*.js'],
  'watch-files': ['tests/mocha/master-thesis/**/*.js'],
  'watch-ignore': [
    'lib/vendor',
    'tests/jest/**/*.js',
    'tests/ava/**/*.js',
    'tests/qunit/**/*.js',
  ],
};
