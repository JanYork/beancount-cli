module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/demo/**',
    '!src/__tests__/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50
    }
  },
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/jest-setup.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(chalk|chalk-animation|gradient-string|figlet|ora|cli-progress|cli-spinners|terminal-link|strip-ansi|table|cli-table3|csv-writer|exceljs|lodash|js-yaml|commander|inquirer)/)'
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  // 优化内存使用
  maxWorkers: 2,
  workerIdleMemoryLimit: '512MB',
  // 禁用并行执行以减少内存使用
  runInBand: true,
  // 增加超时时间
  testTimeout: 30000,
  // 清理资源
  clearMocks: true,
  restoreMocks: true,
  resetMocks: true
};
