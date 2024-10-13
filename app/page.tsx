'use client';
import React, { useState, useEffect } from 'react';
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
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedMode);
    document.documentElement.classList.toggle('dark', savedMode);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('darkMode', newMode.toString());
  };

  const handleCategoryFilter = (category: string | null) => {
    setSelectedCategory(category);
  };

  const filteredProducts = selectedCategory
    ? products.filter((product: Product) => product.category === selectedCategory)
    : products;

  return (
<div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Dark mode toggle button */}
      

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row mt-0 lg:mt-0">
        {/* Sidebar */}
    <aside className="w-full lg:w-1/4 p-4 bg-gray-100 dark:bg-gray-800 sticky top-0">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Filter by Category
          </h2>
          <ul className="flex flex-wrap lg:block gap-2">
            <li>
              <button
                onClick={() => handleCategoryFilter(null)}
                className="block p-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 rounded"
              >
                All
              </button>
            </li>
            <li>
              <button
                onClick={() => handleCategoryFilter('electronics')}
                className="block p-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 rounded"
              >
                Electronics
              </button>
            </li>
            <li>
              <button
                onClick={() => handleCategoryFilter('fashion')}
                className="block p-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 rounded"
              >
                Fashion
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Product Area */}
        <div className="w-full lg:w-3/4 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 bg-white dark:bg-gray-900">
          {filteredProducts.map((product: Product) => (
            <div
              key={product.id}
              className="p-4 shadow-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded h-fit"
            >
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-contain mb-2 bg-white dark:bg-white"
              />
              <h3 className="text-lg font-semibold">{product.name}</h3>
              <p className="text-gray-600 dark:text-gray-400">
                {product.price ? `$${product.price.toFixed(2)}` : 'Price not available'}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
