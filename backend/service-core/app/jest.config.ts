import type {Config} from 'jest'

const config: Config = {
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js"
  ],
  transform: {
    "^.+\\.(ts|tsx)$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.json",
        isolatedModules: true
      }
    ]
  },
  testMatch: [
    "**/tests/*.test.+(ts|tsx|js)",
    "**/tests/**/*.test.+(ts|tsx|js)"
  ],
  collectCoverageFrom: [
    "**/*.{js,jsx,ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**"
  ],
  extensionsToTreatAsEsm: ['.ts'],
}

export default config