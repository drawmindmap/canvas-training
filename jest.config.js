module.exports = {
  collectCoverage: true,
  coverageDirectory: 'coverage',
  rootDir: './',
  testMatch: [
    '**/?(*.)+(spec|test).js?(x)',
  ],
  collectCoverageFrom: [
    'src/**',
  ],
  testEnvironment: 'jest-environment-jsdom-fourteen',
};
