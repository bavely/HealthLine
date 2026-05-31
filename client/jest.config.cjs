module.exports = {
  testEnvironment: "jsdom",
  testMatch: ["<rootDir>/__tests__/**/*.test.ts?(x)"],
  setupFilesAfterEnv: ["<rootDir>/src/test/setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "\\.(css|less|scss)$": "identity-obj-proxy"
  },
  transform: {
    "^.+\\.(ts|tsx)$": ["ts-jest", { tsconfig: "tsconfig.test.json" }]
  },
  clearMocks: true
};
