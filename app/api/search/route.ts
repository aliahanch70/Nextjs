import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
  // Add other properties as needed
}

import { promises as fsPromises } from 'fs';

export async function GET(req: Request) {
  try {
    console.log('Starting search function');
    console.log('Node.js version:', process.version);
    console.log('Environment:', process.env.NODE_ENV);
    console.log('Current working directory:', process.cwd());
    console.log('Available environment variables:', Object.keys(process.env));

    try {
      console.log('Received search request');
      const url = new URL(req.url);
      console.log('Request URL:', url.toString());
      const searchParams = url.searchParams;
      let query = searchParams.get('q');
      console.log('Original search query:', query);
      console.log('Original search query type:', typeof query);

      // Ensure query is always a string
      query = query ? String(query).trim() : '';
      console.log('Processed search query:', query);
      console.log('Processed search query type:', typeof query);

      if (!query) {
        console.log('Invalid or missing search query');
        return new NextResponse(JSON.stringify({ message: 'Valid search query is required' }), {
          status: 400,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      console.log('Query validation passed');

      let products: Product[] = [];
      let lowercaseQuery: string;
      try {
        if (typeof query !== 'string' || query === null || query === undefined) {
          throw new Error('Query is not a valid string');
        }
        lowercaseQuery = query.toLowerCase();
        console.log('Lowercase query:', lowercaseQuery);
        console.log('Lowercase query type:', typeof lowercaseQuery);
      } catch (error) {
        console.error('Error creating lowercase query:', error);
        return new NextResponse(JSON.stringify({ message: 'Internal server error: Invalid query format' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      console.log('Attempting to load products');
      try {
        let cwdContents: string[] = [];
        try {
          cwdContents = await fsPromises.readdir(process.cwd());
          console.log('Contents of current working directory:', cwdContents);
        } catch (err) {
          console.error('Error reading current directory:', err);
        }

        // Try multiple possible locations for the products.json file
        const possiblePaths = [
          path.join(process.cwd(), 'public', 'products.json'),
          path.join(process.cwd(), 'products.json'),
          '/app/public/products.json', // For Vercel serverless functions
        ];

        console.log('Possible file paths:', possiblePaths);

        let fileContents: string | null = null;
        let successfulPath: string | null = null;

        for (const filePath of possiblePaths) {
          try {
            console.log('Attempting to read file:', filePath);
            const stats = await fsPromises.stat(filePath);
            console.log(`File size: ${stats.size} bytes`);
            
            if (stats.size === 0) {
              console.log(`File at ${filePath} is empty, skipping...`);
              continue;
            }

            fileContents = await fsPromises.readFile(filePath, 'utf8');
            console.log('Successfully read file from:', filePath);
            successfulPath = filePath;
            break;
          } catch (err) {
            console.log(`Failed to read from ${filePath}:`, err);
          }
        }

        if (!fileContents) {
          console.log('Unable to read products.json from any known location, using fallback data');
          fileContents = '[{"id":1,"name":"Fallback Product","price":9.99,"description":"This is a fallback product."}]';
        }

        console.log('File contents length:', fileContents.length);
        console.log('File contents preview:', fileContents.substring(0, 100) + '...');
        console.log('Successful file path:', successfulPath || 'Using fallback data');

        try {
          // Check if the file content starts with a valid JSON character
          if (!['{', '['].includes(fileContents.trim()[0])) {
            throw new Error('File does not appear to contain valid JSON');
          }
          console.log('Attempting to parse JSON');
          products = JSON.parse(fileContents);
          console.log('JSON parsed successfully');
          console.log('Number of products loaded:', products.length);
          console.log('First product:', JSON.stringify(products[0]));
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
          console.error('JSON content:', fileContents);
          throw new Error('Invalid JSON format in products data');
        }
      } catch (error) {
        console.error('Error processing product data:', error);
        return new NextResponse(JSON.stringify({ message: 'Error processing product data: ' + error.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      if (!Array.isArray(products)) {
        console.error('Products is not an array');
        return new NextResponse(JSON.stringify({ message: 'Invalid product data format' }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }

      console.log('Filtering products for query:', query);
      console.log('Number of products before filtering:', products.length);
      if (products.length === 0) {
        console.log('No products to filter, returning empty array');
        return new NextResponse(JSON.stringify([]), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      let searchResults = [];
      try {
        searchResults = products.filter((product) => {
          if (!product || typeof product !== 'object') {
            console.log('Invalid product:', product);
            return false;
          }
          console.log('Processing product:', JSON.stringify(product));
          try {
            // Validate product structure
            if (!('name' in product) || !('description' in product)) {
              console.log('Product missing required properties:', product);
              return false;
            }
            const productName = String(product.name || '');
            const productDescription = String(product.description || '');
            console.log('Product name:', productName);
            console.log('Product description:', productDescription);
            
            if (typeof lowercaseQuery !== 'string') {
              console.error('lowercaseQuery is not a string:', lowercaseQuery);
              return false;
            }
            
            let nameMatch = false;
            let descriptionMatch = false;
            
            const safeToLowerCase = (str: string | undefined | null): string => {
              if (typeof str === 'string') {
                try {
                  return str.toLowerCase();
                } catch (error) {
                  console.error('Error in toLowerCase:', error);
                  return str; // Fallback to original string if toLowerCase fails
                }
              }
              return ''; // Return empty string for undefined or null
            };

            const safeLowercaseProductName = safeToLowerCase(productName);
            const safeLowercaseProductDescription = safeToLowerCase(productDescription);

            console.log('Safe lowercase product name:', safeLowercaseProductName);
            console.log('Safe lowercase product description:', safeLowercaseProductDescription);

            try {
              nameMatch = safeLowercaseProductName.includes(lowercaseQuery);
            } catch (error) {
              console.error('Error in name matching:', error);
            }
            
            try {
              descriptionMatch = safeLowercaseProductDescription.includes(lowercaseQuery);
            } catch (error) {
              console.error('Error in description matching:', error);
            }
            
            console.log('Name match:', nameMatch, 'Description match:', descriptionMatch);
            return nameMatch || descriptionMatch;
          } catch (error) {
            console.error('Error processing product:', error);
            console.error('Error stack:', error.stack);
            console.error('Product causing error:', JSON.stringify(product));
            console.error('Query causing error:', query);
            return false;
          }
        });
      } catch (filterError) {
        console.error('Error during product filtering:', filterError);
        console.error('Error stack:', filterError.stack);
        console.error('Products:', JSON.stringify(products));
        console.error('Query:', query);
        return new NextResponse(JSON.stringify({ message: 'Error during product filtering: ' + filterError.message }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        });
      }
      console.log('Number of search results:', searchResults.length);
      console.log('Search results:', JSON.stringify(searchResults));

      // Limit the number of results to 50 for performance
      const limitedResults = searchResults.slice(0, 50);
      console.log('Number of limited results:', limitedResults.length);

      console.log('Preparing to send response');
      return new NextResponse(JSON.stringify(limitedResults), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      });
    } catch (innerError) {
      console.error('Inner error in search route:', innerError);
      console.error('Inner error stack trace:', innerError instanceof Error ? innerError.stack : 'No stack trace available');
      console.error('Inner error details:', JSON.stringify(innerError, Object.getOwnPropertyNames(innerError)));
      throw innerError; // Re-throw the error to be caught by the outer catch block
    }
  } catch (error) {
    console.error('Outer error in search route:', error);
    console.error('Outer error stack trace:', error instanceof Error ? error.stack : 'No stack trace available');
    console.error('Outer error details:', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return new NextResponse(JSON.stringify({ message: 'Internal server error: ' + (error instanceof Error ? error.message : String(error)) }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } finally {
    console.log('Search function completed');
  }
}