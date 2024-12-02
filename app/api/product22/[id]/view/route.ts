import { NextResponse } from 'next/server';
import products from '../../../../../public/products.json';
import fs from 'fs/promises';
import path from 'path';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Find the product by ID
    const product = products.find(p => p.id.toString() === params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Increment view count
    product.views = (product.views || 0) + 1;

    // Update the products.json file
    const productsFilePath = path.join(process.cwd(), 'public', 'products.json');
    await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2));

    return NextResponse.json({ views: product.views });
  } catch (error) {
    console.error('Error updating view count:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}