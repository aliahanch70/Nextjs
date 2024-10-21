import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const productId = parseInt(params.id);
  const productsPath = path.join(process.cwd(), 'public/products.json');

  try {
    const productsData = await fs.readFile(productsPath, 'utf8');
    const products = JSON.parse(productsData);

    const productIndex = products.findIndex((p: any) => p.id === productId);
    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    products[productIndex].views += 1;

    await fs.writeFile(productsPath, JSON.stringify(products, null, 2));

    return NextResponse.json({ views: products[productIndex].views });
  } catch (error) {
    console.error('Error updating view count:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}