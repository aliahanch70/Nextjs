import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PRICE_FILE_PATH = path.join(process.cwd(), 'public', 'price.json');

import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const newPrice = await req.json();

    // Read existing prices
    const pricesData = await fs.readFile(PRICE_FILE_PATH, 'utf-8');
    const prices = JSON.parse(pricesData);

    // Find if price for this product already exists
    const existingPriceIndex = prices.findIndex((p: any) => p.priceId === newPrice.priceId);

    if (existingPriceIndex > -1) {
      // Update existing price
      prices[existingPriceIndex] = { ...prices[existingPriceIndex], ...newPrice, timestamp: new Date().toISOString() };
    } else {
      // Add new price with automatically generated priceId
      const priceId = uuidv4();
      prices.push({ ...newPrice, priceId, timestamp: new Date().toISOString() });
    }

    // Write updated prices back to file
    await fs.writeFile(PRICE_FILE_PATH, JSON.stringify(prices, null, 2));

    return NextResponse.json(newPrice, { status: 200 });
  } catch (error) {
    console.error('Error updating price:', error);
    return NextResponse.json({ error: 'Failed to update price' }, { status: 500 });
  }
}