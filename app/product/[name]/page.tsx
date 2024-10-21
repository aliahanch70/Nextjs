'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';
import products from '../../../public/products.json';
import { Callout } from '@/components/Callout';
import { useCart } from '@/context/CartContext';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  stock: number;
  views: number;
  [key: string]: any; // Allow for additional properties
}

export default function ProductPage() {
  const { name } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [viewCount, setViewCount] = useState<number | null>(null);

  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  const { addToCart } = useCart();

  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };

  const handleAddToCart = (product: Product) => {
    let updatedProduct = { ...product };

    const hasOptions = Object.keys(product).some(key => key.endsWith('Available') || key.endsWith('Options'));

    if (hasOptions) {
      // Update price for options with different prices
      Object.entries(selectedOptions).forEach(([optionName, selectedValue]) => {
        const optionKey = optionName + 'Options';
        if (product[optionKey] && Array.isArray(product[optionKey])) {
          const selectedOption = product[optionKey].find((option: any) => option.size === selectedValue);
          if (selectedOption && selectedOption.price) {
            updatedProduct.price = selectedOption.price;
          }
        }
      });
      addToCart(updatedProduct, selectedOptions);
      console.log('Added to cart:', { ...updatedProduct, selectedOptions });
    } else {
      addToCart(updatedProduct, {});
      console.log('Added to cart:', updatedProduct);
    }
    
    // Show success message
    setShowSuccessMessage(true);
    
    // Hide success message after 2 seconds
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 2000);

    // Reset selected options
    setSelectedOptions({});
  };

  const generateOptionSelectors = () => {
    if (!product) return null;

    const optionKeys = Object.keys(product).filter(key => key.endsWith('Available') || key.endsWith('Options'));

    if (optionKeys.length === 0) return null;

    return optionKeys.map(key => {
      const optionName = key.replace('Available', '').replace('Options', '');
      const options = product[key];

      if (!Array.isArray(options)) return null;

      // Sort options by price (if available)
      const sortedOptions = [...options].sort((a, b) => {
        if (typeof a === 'object' && typeof b === 'object') {
          return (a.price || 0) - (b.price || 0);
        }
        return 0;
      });

      // Set the default selected option to the first (lowest-priced) option
      if (sortedOptions.length > 0 && !selectedOptions[optionName]) {
        const defaultOption = sortedOptions[0];
        handleOptionChange(optionName, defaultOption.size || defaultOption);
      }

      return (
        <div key={key} className="mt-4">
          <label htmlFor={optionName} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {optionName.charAt(0).toUpperCase() + optionName.slice(1)}
          </label>
          <select
            id={optionName}
            name={optionName}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            onChange={(e) => handleOptionChange(optionName, e.target.value)}
            value={selectedOptions[optionName] || ''}
          >
            {sortedOptions.map((option: any) => (
              <option key={option.size || option} value={option.size || option}>
                {option.size || option}{option.price ? ` - $${option.price.toFixed(2)}` : ''}
              </option>
            ))}
          </select>
        </div>
      );
    });
  };

  // Display selected options
  const SelectedOptions = () => {
    return (
      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <h4 className="font-semibold">Selected Options:</h4>
        <ul>
          {Object.entries(selectedOptions).map(([key, value]) => (
            <li key={key}>{key}: {value}</li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      const decodedName = decodeURIComponent(Array.isArray(name) ? name[0] : name);
      const foundProduct = products.find((p: Product) => {
        const productNameNormalized = p.name.toLowerCase().replace(/ /g, '-');
        return decodedName.includes(productNameNormalized) && decodedName.includes(p.id.toString());
      });

      if (foundProduct) {
        setProduct(foundProduct);
        setViewCount(foundProduct.views);

        // Increment view count
        try {
          const response = await fetch(`/api/products/${foundProduct.id}/view`, { method: 'POST' });
          if (response.ok) {
            const updatedViewCount = await response.json();
            setViewCount(updatedViewCount.views);
          }
        } catch (error) {
          console.error('Failed to update view count:', error);
        }
      }

      setLoading(false);
    };

    fetchProduct();
  }, [name]);

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="text-center p-8">
        <p className="text-xl font-semibold mb-4">Sorry, we couldn't find the product you're looking for.</p>
        <p className="mb-4">This might be because:</p>
        <ul className="list-disc list-inside mb-4">
          <li>The product name or ID in the URL might be incorrect</li>
          <li>The product might have been removed from our catalog</li>
        </ul>
        <p className="mb-4">You can try:</p>
        <ul className="list-disc list-inside mb-4">
          <li>Double-checking the URL</li>
          <li>Searching for the product on our main page</li>
          <li>Browsing our categories to find similar products</li>
        </ul>
        <Link href="/" className="text-blue-500 hover:underline">Back to Shop</Link>
      </div>
    );
  }

  const commonFields = ['id', 'name', 'price', 'image', 'category', 'description', 'stock'];

  // Recursive function to render nested properties
  const renderNestedProperties = (obj: any, level: number = 0) => {
    return Object.entries(obj).map(([key, value ]) => {
      const paddingLeft = `${level * 20}px`; // Indent for tree structure

      return (
        <div key={key} style={{ paddingLeft }}>
          <span className="font-semibold text-gray-700 dark:text-gray-300">{key.charAt(0).toUpperCase() + key.slice(1)}: </span>
          {typeof value === 'object' && value !== null ? (
            // Recursively render nested objects
            renderNestedProperties(value, level + 1)
          ) : (
            <span className="text-gray-600 dark:text-gray-400">{value.toString()}</span>
          )}
        </div>
      );
    });
  };

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen relative">
  {showSuccessMessage && (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm">
      <Callout variant="success" title="Product Added to Cart">
        The item has been successfully added to your cart.
      </Callout>
    </div>
  )}
      <div className="container mx-auto p-4 w-full h-full">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <Link href="/" className="text-blue-500 hover:underline mb-4 inline-block">Back to Shop</Link>
          <div className="md:flex">
            <div className="md:flex-shrink-0">
              <img className="h-48 w-full object-cover md:w-48" src={product.image} alt={product.name} />
            </div>
            <div className="mt-4 md:mt-0 md:ml-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{product.name}</h1>
              <div className="mt-4">
                <span className="text-gray-900 dark:text-white font-bold text-xl">${product.price.toFixed(2)}</span>
              </div>
              <div className="mt-4">
                <span className="text-gray-600 dark:text-gray-400">Category: {product.category}</span>
              </div>
              <div className="mt-4">
                <span className="text-gray-600 dark:text-gray-400">Stock: {product.stock}</span>
              </div>
              <div className="mt-4">
                <span className="text-gray-600 dark:text-gray-400">Views: {viewCount !== null ? viewCount : 'Loading...'}</span>
              </div>
              {generateOptionSelectors()}
              <div className="mt-4">
                <button
                  onClick={() => handleAddToCart(product)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={Object.keys(product).some(key => key.endsWith('Available') || key.endsWith('Options')) && Object.keys(selectedOptions).length === 0}
                >
                  <ShoppingCartIcon className="h-5 w-5 mr-2" />
                  Add to Cart
                </button>
                {Object.keys(product).some(key => key.endsWith('Available') || key.endsWith('Options')) && <SelectedOptions />}
              </div>
              <div className="mt-6">
                <div className="flex ">
                  <button
                    className={`dark:text-gray-200 text-gray-600 py-2 px-4 ${activeTab === 'description' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setActiveTab('description')}
                  >
                    Description
                  </button>
                  <button
                    className={`dark:text-gray-200 text-gray-600 py-2 px-4 ${activeTab === 'specifics' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setActiveTab('specifics')}
                  >
                    Specifics
                  </button>
                </div>
                <div className="mt-4">
                  {activeTab === 'description' && (
                    <p className="text-gray-600 dark:text-gray-300">{product.description || 'No description available.'}</p>
                  )}
                  {activeTab === 'specifics' && (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      {renderNestedProperties(
                        // Filter out common fields and only show specifics
                        Object.fromEntries(Object.entries(product).filter(([key]) => !commonFields.includes(key)))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
