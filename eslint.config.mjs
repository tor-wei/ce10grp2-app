import globals from "globals";

export default [
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2021,
      },
      ecmaVersion: 2021,
      sourceType: "module",
    },
    rules: {
      // Add any custom rules here
    },
  },
  {
    files: ["**/*.jsx", "**/*.tsx"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
      ecmaVersion: 2021,
      sourceType: "module",
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
