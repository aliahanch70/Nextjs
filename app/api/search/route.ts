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

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json({ message: 'Search query is required' }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'public', 'products.json');
    const fileContents = await fs.readFile(filePath, 'utf8');
    const products: Product[] = JSON.parse(fileContents);

    const searchResults = products.filter((product) =>
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description.toLowerCase().includes(query.toLowerCase())
    );

    // Limit the number of results to 50 for performance
    const limitedResults = searchResults.slice(0, 50);

    return NextResponse.json(limitedResults);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}