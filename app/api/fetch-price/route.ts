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
    if (!fs.existsSync(priceFilePath)) {
      return [];
    }
    const fileData = fs.readFileSync(priceFilePath, 'utf8');
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
    fs.writeFileSync(priceFilePath, JSON.stringify(prices, null, 2));
  } catch (error: any) {
    console.error('Error writing to file:', error);
    throw error;
  }
};

// Function to extract price from HTML content
const extractPrice = ($: cheerio.CheerioAPI) => {
  const selectors = [
    'div.summary span.price',
    '.product-price',
    '#priceblock_ourprice',
    '.entry-summary .price .woocommerce-Price-amount',
    '[data-price-type="finalPrice"]',
    '.price-current',
  ];

  for (const selector of selectors) {
    const priceText = $(selector).first().text().trim();
    if (priceText) {
      return priceText.replace(/[^\d.,]/g, '');
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
  return safeJsonResponse({ message: 'API is working' }, 200);
}

// POST: Fetch product price from URL and save to price.json
export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const { url } = body;

    if (!url) {
      return safeJsonResponse({ message: 'URL not provided' }, 400);
    }

    const response = await axios.get(url, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!response.data) {
      return safeJsonResponse({ message: 'Empty response from server' }, 500);
    }

    const $ = cheerio.load(response.data);
    const price = extractPrice($);

    if (!price) {
      return safeJsonResponse({ message: 'Price not found' }, 404);
    }

    const prices = readPrices();
    prices.push({ url, price, timestamp: new Date().toISOString() });
    writePrices(prices);

    return safeJsonResponse({ message: 'Price fetched and saved', price }, 200);
  } catch (error: any) {
    return handleError(error);
  }
}

function safeJsonResponse(data: any, status: number) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
