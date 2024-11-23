import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// Path to your JSON file storing the products
const productsFilePath = path.join(process.cwd(), '/public/products.json');
const priceFilePath = path.join(process.cwd(), '/public/price.json');

// Helper function to read products
const readProducts = () => {
  const fileData = fs.readFileSync(productsFilePath, 'utf8');
  return JSON.parse(fileData);
};

// Helper function to write products
const writeProducts = (products: any) => {
  fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 2));
};

// Helper function to read prices
const readPrices = () => {
  const fileData = fs.readFileSync(priceFilePath, 'utf8');
  return JSON.parse(fileData);
};

// Helper function to write prices
const writePrices = (prices: any) => {
  fs.writeFileSync(priceFilePath, JSON.stringify(prices, null, 2));
};

// POST: Add a new product
export async function POST(req: Request) {
  try {
    const newProduct = await req.json(); // Get the new product details from the request body
    const products = readProducts(); // Read the existing products

    // Generate a new ID if not provided (you could modify this as needed)
    newProduct.id = newProduct.id || products.length + 1;

    // Add the new product to the array
    products.push(newProduct);

    // Write the updated products back to the file
    writeProducts(products);

    return NextResponse.json({ message: 'Product added', product: newProduct }, { status: 201 });
  } catch (error:any) {
    return NextResponse.json({ message: 'Error adding product', error: error.message }, { status: 500 });
  }
}

// PUT: Update an existing product
// PUT: Update an existing product
export async function PUT(req: Request) {
  try {
    const updatedProduct = await req.json(); // Get updated product details from the request body
    const products = readProducts(); // Read existing products

    // Check that the product has an ID
    if (!updatedProduct.id) {
      return NextResponse.json({ message: 'Product ID is required' }, { status: 400 });
    }

    // Find the product to update by ID
    const index = products.findIndex((product: any) => product.id === updatedProduct.id);

    if (index === -1) {
      return NextResponse.json({ message: 'Product not found' }, { status: 404 });
    }

    // Update the product in the array
    // Ensure you're only updating fields that exist in the product object
    products[index] = {
      ...products[index], // Retain existing properties
      ...updatedProduct,  // Update with new properties
    };

    // Write the updated products back to the file
    writeProducts(products);

    return NextResponse.json({ message: 'Product updated', product: products[index] }, { status: 200 });
  } catch (error: any) {
    console.error(error); // Log the error for debugging
    return NextResponse.json(
      {
        message: 'Error uploading file',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

