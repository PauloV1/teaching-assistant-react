module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
        "^.+\\.tsx?$": [
            "ts-jest",
            {
                isolatedModules: true,
                tsconfig: "tsconfig.json"
            }
        ]
    },
    transformIgnorePatterns: [],   // MUITO IMPORTANTE
    moduleFileExtensions: ["ts", "js", "tsx"],
    setupFilesAfterEnv: ["<rootDir>/server/jest.setup.ts"]
};
