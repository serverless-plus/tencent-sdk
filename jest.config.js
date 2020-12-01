const { join } = require('path');
require('dotenv').config({ path: join(__dirname, '.env.test') });

const isDebug = process.env.DEBUG === 'true';

const config = {
  verbose: true,
  silent: !isDebug,
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
  testTimeout: 60000,
  testEnvironment: 'node',
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.(js|ts)$',
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/__tests__/fixtures/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};

module.exports = config;
