import { eslintConfigRelax } from "@jsenv/eslint-config-relax";

export default [
  ...eslintConfigRelax({
    rootDirectoryUrl: new URL("./", import.meta.url),
    browserFiles: ["src/**/*.js"],
    jsxPragmaAuto: true,
  }),
  {
    rules: {
      "no-debugger": ["off"],
    },
  },
  {
    ignores: ["experiments/"],
  },
];
