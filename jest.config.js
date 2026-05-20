/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  transform: {
    "^.+\\.(ts|js)$": [
      "ts-jest",
      {
        tsconfig: "./tsconfig.jest.json"
      }
    ]
  },
  moduleNameMapper: {
    "^\\.\\/variables\\.js$": "<rootDir>/src/variables.ts",
    "^\\.\\/actions\\.js$": "<rootDir>/src/actions.ts",
    "^\\.\\/feedbacks\\.js$": "<rootDir>/src/feedbacks.ts",
    "^\\.\\/presets\\.js$": "<rootDir>/src/presets.ts",
    "^\\.\\/upgrades\\.js$": "<rootDir>/src/upgrades.ts",
    "^\\.\\/models\\.js$": "<rootDir>/src/models.ts",
    "^\\.\\/choices\\.js$": "<rootDir>/src/choices.ts",
    "^\\.\\/config\\.js$": "<rootDir>/src/config.ts",
    "^\\.\\/util\\.js$": "<rootDir>/src/util.ts",
    "^\\.\\/types\\.js$": "<rootDir>/src/types.ts",
    "^\\.\\/choices\\/videoFormats\\.js$": "<rootDir>/src/choices/videoFormats.ts",
  },
  testPathIgnorePatterns: ["/dist/"],
};