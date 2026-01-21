/** @type {import('jest').Config} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts"],
  clearMocks: true,
  restoreMocks: true,
  modulePathIgnorePatterns: ["<rootDir>/dist"],
  coverageReporters: ["text", "text-summary", "lcov"],
  collectCoverageFrom: [
    "services/**/*.ts",
    "controllers/**/*.ts",
    "middleware/**/*.ts",
    "routes/**/*.ts",
    "utils/**/*.ts",
    // on exclut ce qu'on ne veut pas compter
    "!**/*.spec.ts",
    "!generated/**",
    "!prisma/**",
    "!coverage/**",
    "!jest.config.*",
  ],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "./tsconfig.jest.json",
      },
    ],
  },
};