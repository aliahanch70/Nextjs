import { NextResponse } from 'next/server';
import products from '../../../../public/products.json';

export async function GET(
  request: Request,
  { params }: { params: { name: string } }
) {
  try {
    const name = decodeURIComponent(params.name);
    const product = products.find((p) => {
      const productNameNormalized = p.name.toLowerCase().replace(/ /g, '-');
      return name.includes(productNameNormalized) && name.includes(p.id.toString());
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}