import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const PRICE_FILE_PATH = path.join(process.cwd(), 'public', 'price.json');

export async function POST(req: Request) {
  try {
    const updateData = await req.json();
    const pricesToUpdate = Array.isArray(updateData) ? updateData : [updateData];

    // Read existing prices
    const pricesData = await fs.readFile(PRICE_FILE_PATH, 'utf-8');
    const existingPrices = JSON.parse(pricesData);

    // Update prices
    pricesToUpdate.forEach((updatedPrice: any) => {
      const index = existingPrices.findIndex((p: any) => p.priceId === updatedPrice.priceId);
      if (index !== -1) {
        existingPrices[index] = { ...existingPrices[index], ...updatedPrice, timestamp: new Date().toISOString() };
      } else {
        // Add new price if it doesn't exist
        const priceId = uuidv4();
        existingPrices.push({ ...updatedPrice, priceId, timestamp: new Date().toISOString() });
      }
    });

    // Write updated prices back to file
    await fs.writeFile(PRICE_FILE_PATH, JSON.stringify(existingPrices, null, 2));

    return NextResponse.json({ message: 'Prices updated successfully', updatedPrices: pricesToUpdate });
  } catch (error) {
    console.error('Error updating prices:', error);
    return NextResponse.json({ error: 'Failed to update prices' }, { status: 500 });
  }
}