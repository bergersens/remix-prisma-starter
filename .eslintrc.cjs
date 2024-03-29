/** @type {import('eslint').Linter.Config} */
module.exports = {
  extends: ["@remix-run/eslint-config", "@remix-run/eslint-config/node"],

  rules: {
    "prefer-template": "error",
    "react/jsx-curly-brace-presence": "error",
  },
};
