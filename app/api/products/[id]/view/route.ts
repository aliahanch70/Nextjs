import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
): Promise<NextResponse>{
  try {
    // Await the params.id
    const productId = params.id;

    const productsPath = path.join(process.cwd(), 'data', 'products.json');
    const productsData = await fs.readFile(productsPath, 'utf-8');
    const products = JSON.parse(productsData);

    // یافتن محصول موردنظر
    const productIndex = products.findIndex((p: any) => p.id === productId);
    if (productIndex === -1) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // افزایش تعداد بازدیدها
    products[productIndex].views = (products[productIndex].views || 0) + 1;

    // ذخیره تغییرات در فایل
    await fs.writeFile(productsPath, JSON.stringify(products, null, 2));

    return NextResponse.json({ views: products[productIndex].views });
  } catch (error) {
    console.error('Error updating view count:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const dynamic = 'force-static';
