import type {Config} from 'jest';

const config: Config = {
  setupFilesAfterEnv: ['./test/jest.setup.ts'],
  verbose: true,
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!**/node_modules/**',
    '!**/vendor/**',
  ],
  coverageDirectory: "test/coverage",
  coverageReporters: ['text', 'text-summary', 'json-summary'],
  testMatch: ['**/test/**/*.test.{ts,tsx}'],
  silent: false,
};

export default config;