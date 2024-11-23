'use client';
import React, { useState, useEffect, useMemo } from 'react';
import products from '../public/products.json';
import Link from 'next/link';
import PriceSlider from '../components/Slider';
import { Box } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';
import { useCart } from '../context/CartContext';

// Pre-calculate initial products and cache them
const INITIAL_PRODUCTS_TO_SHOW = 12;
const sortedInitialProducts = products
  .slice(0, INITIAL_PRODUCTS_TO_SHOW)
  .sort((a, b) => a.price - b.price);

const Shop = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [displayedProducts, setDisplayedProducts] = useState(sortedInitialProducts);
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [sortOption, setSortOption] = useState('price_asc');
  const { cart, addToCart } = useCart();

  // Memoize price range calculations
  const { minPrice, maxPrice } = useMemo(() => {
    const prices = products.map(product => product.price);
    return {
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices)
    };
  }, []);

  // Memoize filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const categoryMatch = !selectedCategory || product.category === selectedCategory;
      const priceMatch = product.price >= priceRange[0] && product.price <= priceRange[1];
      return categoryMatch && priceMatch;
    });
  }, [selectedCategory, priceRange]);

  // Memoize sorted products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      switch (sortOption) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'most_viewed':
          return (b.views ?? 0) - (a.views ?? 0);
          case 'highest-rated':
          return (b.rating?? 0  )- (a.rating ?? 0);
        default:
          return 0;
      }
    });
  }, [filteredProducts, sortOption]);

  // Load more products efficiently
  const loadMoreProducts = () => {
    if (isLoadingMore) return;
    
    setIsLoadingMore(true);
    const currentLength = displayedProducts.length;
    const nextProducts = sortedProducts.slice(
      currentLength,
      currentLength + INITIAL_PRODUCTS_TO_SHOW
    );
    
    setDisplayedProducts(prev => [...prev, ...nextProducts]);
    setPage(prev => prev + 1);
    setIsLoadingMore(false);
  };

  // Intersection Observer setup
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedProducts.length < sortedProducts.length) {
          loadMoreProducts();
        }
      },
      { threshold: 0.1 }
    );

    const sentinel = document.getElementById('sentinel');
    if (sentinel) {
      observer.observe(sentinel);
    }

    return () => observer.disconnect();
  }, [displayedProducts.length, sortedProducts.length]);

  // Reset displayed products when filters change
  useEffect(() => {
    setDisplayedProducts(sortedProducts.slice(0, INITIAL_PRODUCTS_TO_SHOW));
    setPage(1);
  }, [sortedProducts]);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="flex flex-col lg:flex-row mt-0">
        {/* Sidebar */}
        <aside className="w-full lg:w-1/4 p-4 bg-gray-100 dark:bg-gray-800 sticky top-0 h-auto md:h-screen">
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Filter by Category
            </h2>
            <div className="space-y-2">
              {["All", "Electronics", "Fashion"].map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category === "All" ? null : category.toLowerCase())}
                  className={`w-full p-2 text-left rounded ${
                    (category === "All" && !selectedCategory) ||
                    category.toLowerCase()  as string === selectedCategory
                      ? "bg-blue-500 text-white"
                      : "bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
              Price Range
            </h2>
            <Box className="px-4">
              <PriceSlider
                min={minPrice}
                max={maxPrice}
                step={10}
                defaultValue={priceRange}
                onChange={setPriceRange}
              />
            </Box>
          </div>
        </aside>

        {/* Main Product Area */}
        <div className="h-fit w-full lg:w-3/4 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="col-span-full mb-4">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className="w-full sm:w-auto p-2 bg-white dark:bg-gray-700 rounded border border-gray-300 dark:border-gray-600"
            >
              <option value="price_asc">Price (Low to High)</option>
              <option value="price_desc">Price (High to Low)</option>
              <option value="highest-rated">Highest Rated</option>
              <option value="most_viewed">Most Viewed</option>
            </select>
          </div>

          {displayedProducts.map((product) => (
            <Link
              href={`/product/${encodeURIComponent(product.name.toLowerCase().replace(/ /g, '-'))}-${product.id}`}
              key={product.id}
            >
              <div className="h-full p-4 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-shadow">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-48 object-contain mb-4"
                  loading="lazy"
                />
                <h3 className="text-lg font-semibold mb-2 line-clamp-2">{product.name}</h3>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  ${product.price.toFixed(2)}
                </p>
                <div className="flex items-center mt-2">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      color={i < Math.round(product.rating ?? 0) ? "yellow.400" : "gray.300"}
                      boxSize={3}
                    />
                  ))}
                  <span className="ml-1 text-sm text-gray-500">
                    ({product.rating?.toFixed(1)})
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    addToCart({
                      ...product,
                      selectedOptions: product || {}, // Add default value if missing
                    });
                  }}
                  
                  className="mt-3 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center justify-center text-sm transition-colors"
                >
                  <ShoppingCartIcon className="h-4 w-4 mr-2" />
                  Add to Cart
                </button>
              </div>
            </Link>
          ))}

          <div id="sentinel" className="col-span-full h-10">
            {isLoadingMore && (
              <div className="w-full flex justify-center p-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;