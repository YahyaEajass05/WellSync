const nextJest = require('next/jest');
const createJestConfig = nextJest({ dir: './' });
const customJestConfig = {
  testEnvironment: 'jest-environment-jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^three$': '<rootDir>/__mocks__/three.js',
    '^@react-three/fiber$': '<rootDir>/__mocks__/@react-three/fiber.js',
    '^@react-three/drei$': '<rootDir>/__mocks__/@react-three/drei.js',
    '^@react-three/postprocessing$': '<rootDir>/__mocks__/@react-three/postprocessing.js',
  },
  testMatch: ['**/__tests__/**/*.test.(ts|tsx|js|jsx)'],
  collectCoverageFrom: [
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  coverageDirectory: 'coverage',
  moduleDirectories: ['node_modules', '<rootDir>/'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
  },
};
module.exports = createJestConfig(customJestConfig);