/** @type {import('jest').Config} */
export default {
  // Use ESM
  transform: {},
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Add moduleNameMapper to resolve .js imports to .ts source files
  moduleNameMapper: {
    // Map imports ending in '.js' to their '.ts' equivalent
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  
  // TypeScript configuration
  preset: 'ts-jest/presets/default-esm',
  
  // Test environment
  testEnvironment: 'node',
  
  // Test patterns
  testMatch: [
    '**/__tests__/**/*.test.ts'
  ],
  
  // Module extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  
  // Setup timeout
  testTimeout: 30000,
  
  // Coverage
  collectCoverage: false,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!**/__tests__/**'
  ]
}; 