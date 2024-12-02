import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Path to your JSON file
const filePath = path.join(process.cwd(), 'public/products.json');

// Function to load the products from the JSON file
function loadProducts() {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(fileContent);
}

// Function to save the products back to the JSON file
function saveProducts(products: any[]) {
  fs.writeFileSync(filePath, JSON.stringify(products, null, 2));
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { id } = params;
  const products = loadProducts(); // Load the products from the JSON file
  
  const productIndex = products.findIndex((product: any) => product.id === parseInt(id));

  if (productIndex === -1) {
    return NextResponse.json({ error: 'Product not found' }, { status: 404 });
  }

  // Remove the product from the array
  products.splice(productIndex, 1);

  // Save the updated product list back to the JSON file
  saveProducts(products);

  return NextResponse.json({ success: true, message: `Product with ID ${id} deleted.` });
}
