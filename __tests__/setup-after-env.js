// This file patches the behavior of --bail flag for Jest to make it fail immediately after the first failed test
// in any test suite. More details: https://github.com/jestjs/jest/issues/2867

const failFast = require('jasmine-fail-fast')

if (process.argv.includes('--bail')) {
  const jasmineEnv = jasmine.getEnv()
  jasmineEnv.addReporter(failFast.init())
}
