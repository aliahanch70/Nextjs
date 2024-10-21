'use client';
import React, { useState, useEffect } from 'react';
import products from '../public/products.json';
import Link from 'next/link';
import PriceSlider from '../components/Slider';
import { Box } from '@chakra-ui/react';
import { Progress } from '@chakra-ui/react'
import { StarIcon } from '@chakra-ui/icons'
import { ShoppingCartIcon } from '@heroicons/react/24/solid'
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  views:number;
}

// Calculate min and max price outside of component
const prices = products.map(product => product.price);
const initialMinPrice = Math.min(...prices);
const initialMaxPrice = Math.max(...prices);

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([initialMinPrice, initialMaxPrice]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [darkMode, setDarkMode] = useState(true);
  const [sortOption, setSortOption] = useState<'price_asc' | 'price_desc' | 'highest-rated' | 'most_viewed'>('price_asc');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [showMobileSort, setShowMobileSort] = useState(false);
  const { cart, addToCart } = useCart();

  // Instead of recalculating, use already computed min and max prices
  const [minPrice, setMinPrice] = useState<number>(initialMinPrice);
  const [maxPrice, setMaxPrice] = useState<number>(initialMaxPrice);

  // Force re-render when cart changes
  useEffect(() => {
    // This empty dependency array ensures the effect runs only once when the component mounts
  }, [cart]);

  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
    setShowMobileSort(false);
  };

  const toggleMobileSort = () => {
    setShowMobileSort(!showMobileSort);
    setShowMobileFilters(false);
  };

  const sortProducts = (products: Product[]) => {
    switch (sortOption) {
      case 'price_asc':
        return [...products].sort((a, b) => a.price - b.price);
      case 'price_desc':
        return [...products].sort((a, b) => b.price - a.price);
      case 'most_viewed':
        return [...products].sort((a, b) => b.views - a.views);
      case 'highest-rated':
        return [...products].sort((a, b) => b.rating - a.rating);
      default:
        return products;
    }
  };

  useEffect(() => {
    // Set dark mode as default
    setDarkMode(true);
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'true');
  }, []);

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

  const handlePriceRangeChange = (values: [number, number]) => {
    setPriceRange(values);
    // Update filtered products immediately when the slider changes
    const newFilteredProducts = products.filter((product: Product) => {
      const categoryMatch = !selectedCategory || product.category === selectedCategory;
      const priceMatch = product.price >= values[0] && product.price <= values[1];
      return categoryMatch && priceMatch;
    });
    setFilteredProducts(newFilteredProducts);
  };

  useEffect(() => {
    const newFilteredProducts = products.filter((product: Product) => {
      const categoryMatch = !selectedCategory || product.category === selectedCategory;
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
      return categoryMatch && priceMatch;
    });
    const sortedProducts = sortProducts(newFilteredProducts);
    setFilteredProducts(sortedProducts);
  }, [selectedCategory, priceRange, sortOption]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Dark mode toggle button */}

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row mt-0 lg:mt-0">
        {/* Mobile Filter and Sort Buttons */}
        <div className="lg:hidden flex justify-between p-4 bg-gray-200 dark:bg-gray-800">
          <button
            onClick={toggleMobileFilters}
            className={`px-4 py-2 ${showMobileFilters ? 'bg-blue-600' : 'bg-blue-500'} text-white rounded`}
          >
            Filters
          </button>
          <button
            onClick={toggleMobileSort}
            className={`px-4 py-2 ${showMobileSort ? 'bg-blue-600' : 'bg-blue-500'} text-white rounded`}
          >
            Sort
          </button>
        </div>

        {/* Sidebar */}
        <aside className={`w-full lg:w-1/4 p-4 bg-gray-100 dark:bg-gray-800 sticky top-0 h-auto md:h-screen ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Filter by Category
          </h2>
          <ul className="flex flex-wrap lg:block gap-2 mb-4">
            <li>
              <button
                onClick={() => handleCategoryFilter(null)}
                className={`block p-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 rounded ${selectedCategory === null ? 'bg-blue-500 text-white' : ''}`}
              >
                All
              </button>
            </li>
            <li>
              <button
                onClick={() => handleCategoryFilter('electronics')}
                className={`block p-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 rounded ${selectedCategory === 'electronics' ? 'bg-blue-500 text-white' : ''}`}
              >
                Electronics
              </button>
            </li>
            <li>
              <button
                onClick={() => handleCategoryFilter('fashion')}
                className={`block p-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 rounded ${selectedCategory === 'fashion' ? 'bg-blue-500 text-white' : ''}`}
              >
                Fashion
              </button>
            </li>
          </ul>
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            Filter by Price
          </h2>
          <Box className="flex flex-col gap-2 px-5">
            <PriceSlider
              min={minPrice}  // Use dynamic min price
              max={maxPrice}  // Use dynamic max price
              step={10}
              defaultValue={priceRange}
              onChange={handlePriceRangeChange}
            />
          </Box>
        </aside>

        {/* Main Product Area */}
        <div className="h-fit w-full lg:w-3/4 p-2 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 sm:gap-4 bg-white dark:bg-gray-900">
          {/* Mobile Sort Options */}
          <div className={`col-span-full mb-4 lg:hidden ${showMobileSort ? 'block' : 'hidden'}`}>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as 'price_asc' | 'price_desc' | 'highest-rated' | 'most_viewed')}
              className="w-full p-2 bg-white dark:bg-gray-300 rounded"
            >
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="highest-rated">Highest Rated</option>
              <option value="most_viewed">Most Viewed</option>
            </select>
          </div>

          {/* Desktop Sort Options */}
          <div className="col-span-full mb-4 hidden lg:block">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Sort Products
            </h2>
            <ul className="flex gap-2 mb-4">
              <li>
                <button
                  onClick={() => setSortOption('price_asc')}
                  className={`p-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 rounded ${
                    sortOption === 'price_asc' ? 'bg-blue-500 text-white' : ''
                  }`}
                >
                  Price (Low to High)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSortOption('price_desc')}
                  className={`p-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 rounded ${
                    sortOption === 'price_desc' ? 'bg-blue-500 text-white' : ''
                  }`}
                >
                  Price (High to Low)
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSortOption('highest-rated')}
                  className={`p-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 rounded ${
                    sortOption === 'highest-rated' ? 'bg-blue-500 text-white' : ''
                  }`}
                >
                  Highest Rated
                </button>
              </li>
              <li>
                <button
                  onClick={() => setSortOption('most_viewed')}
                  className={`p-2 text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-700 rounded ${
                    sortOption === 'most_viewed' ? 'bg-blue-500 text-white' : ''
                  }`}
                >
                  Most Viewed
                </button>
              </li>
            </ul>
          </div>
          {filteredProducts.map((product: Product) => (
            <Link href={`/product/${encodeURIComponent(product.name.toLowerCase().replace(/ /g, '-'))}-${product.id}`} key={product.id}>
              <div
                className="h-max p-3 sm:p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg flex flex-col transition-transform duration-300 ease-in-out transform hover:dark:bg-gray-700 hover:bg-gray-200 hover:shadow-lg"
              >
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-40 sm:h-48 object-contain mb-3 sm:mb-4 bg-white rounded"
                />
                <h3 className="text-base sm:text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-auto font-medium">
                  {product.price ? `$${product.price.toFixed(2)}` : 'Price not available'}
                </p>
                <div className="flex items-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      color={i < Math.round(product.rating) ? "yellow.400" : "gray.300"}
                      boxSize={3}
                    />
                  ))}
                  <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                    ({product.rating.toFixed(1)})
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart(product);
                  }}
                  className="mt-2 bg-blue-500 text-white px-2 py-1 rounded-md flex items-center text-sm"
                >
                  <ShoppingCartIcon className="h-4 w-4 mr-1" />
                  Add to Cart
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Shop;
