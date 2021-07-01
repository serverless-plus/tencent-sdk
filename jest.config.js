const { join } = require('path');
require('dotenv').config({ path: join(__dirname, '.env.test') });

const isCI = !!process.env.CI;
const mod = process.env.MODULE;

const config = {
  verbose: true,
  silent: isCI,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.base.json',
    },
  },
  testTimeout: 60000,
  testEnvironment: 'node',
  testRegex: '/packages/.*/__tests__/.*\\.(test|spec)\\.(js|ts)$',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/__tests__/fixtures/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

if (mod) {
  config.testRegex = `/${mod}/__tests__/.*\\.(test|spec)\\.(js|ts)$`;
}

module.exports = config;
