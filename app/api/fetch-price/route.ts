import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

const publicDir = path.join(process.cwd(), '/public');
const priceFilePath = path.join(publicDir, 'price.json');

// Helper function to ensure the public directory exists and is writable
const ensurePublicDirExists = () => {
  if (!fs.existsSync(publicDir)) {
    console.log('Creating public directory');
    fs.mkdirSync(publicDir, { recursive: true });
  }
  try {
    fs.accessSync(publicDir, fs.constants.W_OK);
    console.log('Public directory is writable');
  } catch (error) {
    console.error('Public directory is not writable:', error);
    throw new Error('Public directory is not writable');
  }
};

// Helper function to read prices
const readPrices = () => {
  ensurePublicDirExists();
  try {
    console.log('Attempting to read file:', priceFilePath);
    if (!fs.existsSync(priceFilePath)) {
      console.log('price.json does not exist, returning empty array');
      return [];
    }
    const fileData = fs.readFileSync(priceFilePath, 'utf8');
    console.log('File read successfully');
    return JSON.parse(fileData);
  } catch (error: any) {
    console.error('Error reading prices:', error);
    throw error;
  }
};

// Helper function to write prices
const writePrices = (prices: any) => {
  ensurePublicDirExists();
  try {
    console.log('Attempting to write file:', priceFilePath);
    fs.writeFileSync(priceFilePath, JSON.stringify(prices, null, 2));
    console.log('File written successfully');
  } catch (error: any) {
    console.error('Error writing to file:', error);
    throw error;
  }
};

// Function to extract price from HTML content
const extractPrice = ($: cheerio.Root) => {
  // Try different common price selectors
  const selectors = [
    // 'span.price',
    'div.summary span.price',
    '.product-price',
    '#priceblock_ourprice',
    '.entry-summary .price .woocommerce-Price-amount',//
    // '.price-box .price',
    '#product-price',
    '[data-price-type="finalPrice"]',
    '[data-testid="price-final"]',
    '.price-current'
  ];

  for (const selector of selectors) {
    try {
      const priceText = $(selector).first().text().trim();
      if (priceText) {
        // Extract numbers from the price text
        const price = priceText.replace(/[^\d.,]/g, '');
        if (price) return price;
      }
    } catch (error) {
      console.error(`Error extracting price with selector ${selector}:`, error);
    }
  }

  return null;
};

// Custom error handler
const handleError = (error: any) => {
  console.error('Caught error:', error);
  return safeJsonResponse({ message: 'An unexpected error occurred', error: error.message }, 500);
};

// GET: Simple test route
export async function GET(req: Request) {
  console.log('GET function called');
  return safeJsonResponse({ message: 'API is working' }, 200);
}

// POST: Fetch product price from URL and save to price.json
export async function POST(req: Request) {
  console.log('POST function called');
  try {
    console.log('Reading raw request body');
    const rawBody = await req.text();
    console.log('Raw request body:', rawBody);

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return safeJsonResponse({ message: 'Invalid JSON in request body' }, 400);
    }

    console.log('Parsed request body:', body);
    const { url } = body;
    if (!url) {
      console.error('URL not provided in request body');
      return safeJsonResponse({ message: 'URL not provided' }, 400);
    }
    console.log(`Fetching price for URL: ${url}`);

    let response;
    try {
      console.log('Sending axios request');
      response = await axios.get(url, { 
        timeout: 10000, // 10 seconds timeout
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        validateStatus: function (status) {
          return status >= 200 && status < 300; // default
        }
      });
      console.log('Axios request completed');

      if (!response.data) {
        console.error('Response data is empty');
        return safeJsonResponse({ message: 'Empty response from server' }, 500);
      }

      console.log('Response data type:', typeof response.data);
      console.log('Response data length:', response.data.length);
    } catch (fetchError: any) {
      console.error('Error fetching URL:', fetchError);
      if (fetchError.code === 'ECONNABORTED') {
        return safeJsonResponse({ message: 'Request timed out', error: 'The request took too long to complete' }, 504);
      }
      return safeJsonResponse({ message: 'Error fetching URL', error: fetchError.message }, 500);
    }

    if (!response || !response.data) {
      console.error('Invalid response from axios');
      return safeJsonResponse({ message: 'Invalid response from server' }, 500);
    }

    let $;
    try {
      console.log('Parsing HTML with cheerio');
      if (response.data) {
  try {
    $ = cheerio.load(response.data);
    console.log('Cheerio successfully loaded the HTML');
  } catch (cheerioError) {
    console.error('Error loading HTML with Cheerio:', cheerioError);
    return safeJsonResponse({ message: 'Error parsing HTML with Cheerio', error: cheerioError.message }, 500);
  }
} else {
  console.error('Response data is empty or undefined');
  return safeJsonResponse({ message: 'Invalid response data' }, 500);
}
      console.log('HTML parsed successfully');
    } catch (parseError: any) {
      console.error('Error parsing HTML:', parseError);
      return safeJsonResponse({ message: 'Error parsing HTML', error: parseError.message }, 500);
    }
    
    console.log('Extracting price');
    const price = extractPrice($);
    console.log(`Extracted price: ${price}`);
    
    if (!price) {
      console.log('Price not found');
      return safeJsonResponse({ message: 'Price not found' }, 404);
    }

    let prices;
    try {
      console.log('Reading existing prices');
      prices = readPrices();
      console.log('Existing prices read successfully');
    } catch (readError: any) {
      console.error('Error reading prices:', readError);
      return safeJsonResponse({ message: 'Error reading prices', error: readError.message }, 500);
    }

    prices.push({ url, price, timestamp: new Date().toISOString() });

    try {
      console.log('Writing updated prices');
      writePrices(prices);
      console.log('Prices written successfully');
    } catch (writeError: any) {
      console.error('Error writing prices:', writeError);
      return safeJsonResponse({ message: 'Error saving price', error: writeError.message }, 500);
    }

    console.log('Price fetched and saved successfully');
    return safeJsonResponse({ message: 'Price fetched and saved', price }, 200);
  } catch (error:any) {
    console.error('Unhandled error in POST function:', error);
    return handleError(error);
  }
}

function safeJsonResponse(data: any, status: number) {
  try {
    return NextResponse.json(data, { status }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  } catch (error) {
    console.error('Error creating NextResponse:', error);
    return new Response(JSON.stringify({ message: 'Internal Server Error' }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }
}

// Remove the bodyParser configuration
// export const config = {
//   api: {
//     bodyParser: false,
//   },
// };