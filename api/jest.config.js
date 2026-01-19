/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts"],
  clearMocks: true,
  restoreMocks: true,
  modulePathIgnorePatterns: ["<rootDir>/dist"],
};