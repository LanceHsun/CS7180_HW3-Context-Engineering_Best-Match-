import nextConfig from "eslint-config-next";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = [
  {
    ignores: [".next/**", "out/**", "build/**", "design/**", "next-env.d.ts"],
  },
  ...nextConfig,
  prettierConfig,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;
