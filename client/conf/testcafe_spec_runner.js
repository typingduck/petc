'use strict'

const createTestCafe = require('testcafe')
const glob = require('glob')

const testFiles = glob.sync('test/spec/**/*.js').filter(f => f.endsWith('test.js'))

let testcafe = null

createTestCafe('localhost')
  .then(tc => {
    testcafe = tc
    const runner = testcafe.createRunner()
    return runner
      .src(testFiles)
      .browsers(['chrome'])
      .concurrency(2)
      .reporter('spec')
      .run({
        selectorTimeout: 100000,
        assertionTimeout: 10000,
        visibilityCheck: true
      })
  })
  .then(failedCount => {
    console.log('Tests failed: ' + failedCount)
    testcafe.close().then(() => process.exit(failedCount ? 1 : 0))
  }).catch(e => {
    console.error(e)
    process.exit(1)
  })
