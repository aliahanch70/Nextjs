'use client'
import React, { useState } from 'react';
import products from '../public/products.json';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
}

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
  };

  // Filter products based on the selected category
  const filteredProducts = selectedCategory
    ? products.filter((product: Product) => product.category === selectedCategory)
    : products;

  return (
    <div className="flex">
      {/* Sidebar */}
      <aside className="w-1/4 p-4 bg-gray-100">
        <h2 className="text-lg font-semibold mb-4">Filter by Category</h2>
        <ul>
          <li>
            <button onClick={() => handleCategoryFilter(null)} className="block p-2">
              All
            </button>
          </li>
          <li>
            <button onClick={() => handleCategoryFilter('electronics')} className="block p-2">
              Electronics
            </button>
          </li>
          <li>
            <button onClick={() => handleCategoryFilter('fashion')} className="block p-2">
              Fashion
            </button>
          </li>
          {/* Add more categories as needed */}
        </ul>
      </aside>

      {/* Main Product Area */}
      <div className="w-3/4 p-4 grid grid-cols-3 gap-4">
        {filteredProducts.map((product: Product) => (
          <div key={product.id} className="border p-4 shadow-lg">
            <img src={product.image} alt={product.name} className="w-full h-48 object-contain" />
            <h3 className="mt-2 text-lg font-semibold">{product.name}</h3>
            <p className="text-gray-600">
              {product.price ? `$${product.price.toFixed(2)}` : 'Price not available'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Shop;

