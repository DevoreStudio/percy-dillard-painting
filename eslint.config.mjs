import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettierConfig from "eslint-config-prettier";

// eslint-config-next already registers the `jsx-a11y` plugin internally
// (with a curated subset of 6 rules). ESLint's flat config does not allow
// a plugin name to be registered twice, so we apply jsx-a11y's full
// "recommended" rule set (34 rules) without its `plugins` key — the
// plugin instance next already registered is the same package.
const jsxA11yRecommended = { ...jsxA11y.flatConfigs.recommended };
delete jsxA11yRecommended.plugins;

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Accessibility linting. Supplements manual WCAG QA — does not
  // guarantee compliance on its own.
  jsxA11yRecommended,
  // Must come after every rule-defining config above (order matters in
  // flat config): disables ESLint stylistic rules that would conflict
  // with Prettier, which owns formatting. The globalIgnores entry below
  // only sets ignore patterns, not rules, so its position doesn't matter.
  prettierConfig,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
