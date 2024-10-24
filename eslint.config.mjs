import globals from "globals";
import pluginJs from "@eslint/js";


export default [
  {files: ["**/*.js"], languageOptions: {sourceType: "script"}},
  {languageOptions: { globals: globals.browser }},
  pluginJs.configs.recommended,
    {
      rules: {
          "no-unused-vars": "off",
          "no-undef": "off"
      }
  },
];
