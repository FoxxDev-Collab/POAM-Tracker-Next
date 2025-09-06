import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Security rules
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-eval": "error",
      "no-implied-eval": "error",
      "no-script-url": "error",
      "no-unsafe-optional-chaining": "error",
      
      // React security
      "react/jsx-no-script-url": "error",
      "react/jsx-no-target-blank": ["error", { "allowReferrer": false }],
      
      // General security
      "no-console": ["warn", { "allow": ["warn", "error"] }],
      "no-debugger": "error",
    },
  },
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "backend/dist/**",
      "backend/**/*.spec.ts",
      "backend/**/*.test.ts",
    ],
  },
];

export default eslintConfig;
