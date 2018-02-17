module.exports = {
    "extends": [
        "eslint:recommended",
        "plugin:react/recommended"
    ],
    "env": {
        "es6": true,
    },
    "parserOptions": {
        "ecmaVersion": 8,
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true,
            "arrowFunctions": true,
        },
    },
    "rules": {
        "indent": [
            "error",
            2,
            { "SwitchCase": 1 }
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "never"
        ],
        // For early development turn off prop type checking
        "react/prop-types": 0
    },
    "globals": {
      "Symbol": true,
      "assert": true,
      "describe": true,
      "it": true,
      "jest": true,
      "window": true,
    }
};
