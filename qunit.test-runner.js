var testrunner = require('qunit');

console.log(testrunner);

testrunner.setup({
  log: {
    assertions: true,
    errors: true,
    tests: true,
    summary: true,
    globalSummary: true,
    coverage: true,
    globalCoverage: true,
    testing: true,
  },
  coverage: false,
  deps: null,
  namespace: null,
  maxBlockDuration: 2000,
});

testrunner.run(
  {
    code: '/startup.js',
    tests: ['/tests/qunit/master-thesis/tests-1.spec.js'],
  },
  callback,
);
