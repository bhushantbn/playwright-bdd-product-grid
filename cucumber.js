module.exports = {
  default: {
    parallel: process.env.PARALLEL ? parseInt(process.env.PARALLEL, 10) : 1,
    formatOptions: {
      snippetInterface: "async-await"
    },
    paths: [
      "src/features/**/*.feature"
    ],
    require: [
      "src/steps/**/*.ts",
      "src/hooks/**/*.ts"
    ],
    requireModule: [
      "ts-node/register"
    ],
    format: [
      "summary",
      "html:test-results/cucumber-report.html"
    ]
  }
};
