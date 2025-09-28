// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/*.spec.ts'],
  verbose: true,
  maxWorkers: process.env.CI ? '50%' : '100%',
  testTimeout: 60_000,
  reporters: process.env.CI
    ? ['default', ['jest-junit', { outputDirectory: './reports', outputName: 'junit.xml' }]]
    : ['default'],
};
export default config;
