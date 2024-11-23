module.exports = {
  root: true,
  parser: '@typescript-eslint/parser', // استفاده از TypeScript parser
  plugins: ['@typescript-eslint'], // افزونه‌ها
  extends: [
    'eslint:recommended', // قواعد پایه
    'plugin:@typescript-eslint/recommended', // قواعد پیشنهادی برای TypeScript
    'next/core-web-vitals', // تنظیمات Next.js
  ],
  rules: {
    // تنظیمات اختیاری قواعد
    "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-interface": "off",
      "@typescript-eslint/no-empty-function": "off",
      "@typescript-eslint/no-empty-pattern": "off",
      "@typescript-eslint/no-unsafe-enum-comparison": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-empty-object-type": "off",


      "@typescript-eslint/no-non-null-assertion": "off",

      "@typescript-eslint/no-unnecessary-type-assertion": "off",
      "@typescript-eslint/no-unnecessary-type-constraint": "off",
      "@typescript-eslint/no-unnecessary-type-parameters": "off",
      "@typescript-eslint/no-unnecessary-qualifier": "off",


  },
};
