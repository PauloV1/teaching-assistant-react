module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    transform: {
        "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
    },
    moduleFileExtensions: ["ts", "tsx", "js"],
};
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
    moduleFileExtensions: ["ts", "js", "tsx"]
};