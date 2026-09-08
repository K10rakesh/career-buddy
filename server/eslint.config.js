const js = require("@eslint/js");
const globals = require("globals");
const jest = require("eslint-plugin-jest");

module.exports = [
    js.configs.recommended,

    {
        files: ["**/*.js"],

        languageOptions: {
            globals: {
                ...globals.node
            },

            ecmaVersion: "latest",
            sourceType: "commonjs"
        },

        rules: {
            "no-unused-vars": "error",
            "no-console": "off"
        }
    },

    {
        files: ["tests/**/*.js"],

        plugins: {
            jest
        },

        languageOptions: {
            globals: {
                ...globals.jest
            }
        },

        rules: {
            ...jest.configs.recommended.rules
        }
    },

    {
        ignores: [
            "node_modules/"
        ]
    }
];