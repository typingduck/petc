import lint from 'mocha-eslint'

var paths = [
  'src/**/*.js',
  'spec/**/*.js'
]

var options = {
  // Specify style of output
  formatter: 'compact',  // Defaults to `stylish`

  // Only display warnings if a test is failing
  alwaysWarn: false,  // Defaults to `true`, always show warnings

  // Consider linting warnings as errors and return failure
  strict: true,  // Defaults to `false`, only notify the warnings

  // Specify the mocha context in which to run tests
  contextName: 'eslint'  // Defaults to `eslint`, but can be any string
}

// Run the tests
lint(paths, options)
