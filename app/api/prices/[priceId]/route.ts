import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const PRICE_FILE_PATH = path.join(process.cwd(), 'public', 'price.json');

export async function GET(
  request: Request,
  { params }: { params: { priceId: string } }
) {
  try {
    const { priceId } = params;

    // Read existing prices
    const pricesData = await fs.readFile(PRICE_FILE_PATH, 'utf-8');
    let prices = JSON.parse(pricesData);

    // Find the price with the given priceId
    const price = prices.find((p: any) => p.priceId === priceId);

    if (!price) {
      return NextResponse.json({ error: 'Price not found' }, { status: 404 });
    }

    return NextResponse.json(price);
  } catch (error) {
    console.error('Error fetching price:', error);
    return NextResponse.json({ error: 'Failed to fetch price' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { priceId: string } }
) {
  console.log('PUT method called with priceId:', params.priceId);
  try {
    const { priceId } = params;
    const updatedPrice = await request.json();
    console.log('Received updated price data:', updatedPrice);

    // Read existing prices
    const pricesData = await fs.readFile(PRICE_FILE_PATH, 'utf-8');
    let prices = JSON.parse(pricesData);

    // Find and update the price with the given priceId
    const updatedPrices = prices.map((p: any) => {
      if (p.priceId === priceId) {
        return { ...p, ...updatedPrice, priceId };
      }
      return p;
    });

    // Write updated prices back to file
    await fs.writeFile(PRICE_FILE_PATH, JSON.stringify(updatedPrices, null, 2));

    console.log('Price updated successfully');
    return NextResponse.json({ message: 'Price updated successfully' });
  } catch (error) {
    console.error('Error updating price:', error);
    return NextResponse.json({ error: 'Failed to update price' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { priceId: string } }
) {
  try {
    const { priceId } = params;

    // Read existing prices
    const pricesData = await fs.readFile(PRICE_FILE_PATH, 'utf-8');
    let prices = JSON.parse(pricesData);

    // Filter out the price with the given priceId
    prices = prices.filter((p: any) => p.priceId !== priceId);

    // Write updated prices back to file
    await fs.writeFile(PRICE_FILE_PATH, JSON.stringify(prices, null, 2));

    return NextResponse.json({ message: 'Price deleted successfully' });
  } catch (error) {
    console.error('Error deleting price:', error);
    return NextResponse.json({ error: 'Failed to delete price' }, { status: 500 });
  }
}

// Add OPTIONS method to handle preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}