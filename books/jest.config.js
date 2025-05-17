/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  moduleDirectories : ['node_modules', 'src'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@controllers/(.*)$': '<rootDir>/src/controllers/$1',
    '^@features/(.*)$': '<rootDir>/src/features/$1',
    '^@fixtures/(.*)$': '<rootDir>/src/_test_/fixtures/$1',
    '^@data/(.*)$': '<rootDir>/src/data/$1',
    '^@libs/(.*)$': '<rootDir>/src/libs/$1',
    '^@routes/(.*)$': '<rootDir>/src/routes/$1',
  },  
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testMatch: ['**/*.test.ts'],
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.test.{ts,js}',
    '!src/**/*.spec.{ts,js}',
    '!**/node_modules/**',
    '!src/app.ts',
    '!src/server.ts',
    '!src/_test_/**',
    '!src/config/config.ts',
    '!src/libs/ioc.container.ts',
    '!src/libs/ioc.types.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      lines: 85,
      branches: 75,
      functions: 85,
      statements: 85
    }
  }
};
