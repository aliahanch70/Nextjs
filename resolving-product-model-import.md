# Resolving '@/models/Product' Import Issue

We've made the following changes to resolve the "Module not found: Can't resolve '@/models/Product'" error:

1. Created the `Product.ts` file in the `models` directory with the correct Mongoose schema and model export.
2. Updated the `app/product/[name]/page.tsx` file to import the Product model correctly.
3. Verified that the `tsconfig.json` file has the correct path mapping for the `@` alias.

If you're still encountering the error, please try the following steps:

1. Ensure that all files are saved.
2. Stop the development server if it's running.
3. Clear any build caches by running:
   ```
   npm run build
   ```
   or
   ```
   yarn build
   ```
4. Restart the development server:
   ```
   npm run dev
   ```
   or
   ```
   yarn dev
   ```

If the error persists after these steps, please check the following:

- Ensure that the `models` directory is in the root of your project.
- Verify that there are no typos in the import statement or file names.
- Check if there are any other error messages in the console that might provide additional context.

If you continue to face issues, please provide any error messages or additional context so we can further assist you.