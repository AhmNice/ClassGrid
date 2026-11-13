import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",

  testEnvironment: "node",
  // extensionToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.jest.json",
      },
    ],
  },

  moduleNameMapper: {
    "^@/(.*)\\.js$": "<rootDir>/src/$1", // @/lib/prisma.js -> src/lib/prisma
    "^@/(.*)$": "<rootDir>/src/$1", // @/lib/prisma    -> src/lib/prisma
    "^(\\.{1,2}/.*)\\.js$": "$1", // ./foo.js        -> ./foo
  },
  setupFilesAfterEnv: ["<rootDir>/src/tests/setup.ts"],
  clearMocks: true,
};

export default config;
