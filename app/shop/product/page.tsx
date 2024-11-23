'use client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ExternalLink, ShoppingCart, Star } from "lucide-react";
import { ProductType } from "@/lib/types";
import ProductManager from "@/components/ProductManager";
import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { ShoppingCartIcon, PencilIcon } from '@heroicons/react/24/solid';
import products from '../../../public/products.json';
import priceData from '../../../public/price.json';
import { Callout } from '@/components/Callout';
import { useCart } from '@/context/CartContext';
import { useCurrentTime } from '@/hooks/useCurrentTime';

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

export default function ShopProductPage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [prices, setPrices] = useState<any[]>([]);
  const [editingPrice, setEditingPrice] = useState<any>(null);

  const { addToCart } = useCart();
  const currentTime = useCurrentTime();

  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    const fetchPrices = async () => {
      const response = await fetch('/price.json');
      const allPrices = await response.json();
      const productPrices = allPrices.filter((price: any) => {
        if (price.id && price.id.toString() === product?.id?.toString()) {
          return true;
        }
        if (price.url && product?.name) {
          const productNameInUrl = product.name.toLowerCase().replace(/ /g, '-');
          return price.url.toLowerCase().includes(productNameInUrl);
        }
        return false;
      });
      setPrices(productPrices);
    };

    if (product) {
      fetchPrices();
    }
  }, [product]);

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({ ...prev, [optionName]: value }));
  };

  const handleAddToCart = (product: Product) => {
    const updatedProduct = { ...product };

    const hasOptions = Object.keys(product).some(key => key.endsWith('Available') || key.endsWith('Options'));

    if (hasOptions) {
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
    
    setShowSuccessMessage(true);
    
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 2000);

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

      const sortedOptions = [...options].sort((a, b) => {
        if (typeof a === 'object' && typeof b === 'object') {
          return (a.price || 0) - (b.price || 0);
        }
        return 0;
      });

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
      // Instead of using URL params, we'll need to handle this differently
      // This is where you would typically fetch the product based on your shop's logic
      const firstProduct = products[0]; // For example, showing the first product
      
      if (firstProduct) {
        setProduct(firstProduct);
        setViewCount(firstProduct.views);

        try {
          const response = await fetch(`/api/products/${firstProduct.id}/view`, { method: 'POST' });
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
  }, []);

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (!product) {
    return (
      <div className="text-center p-8">
        <p className="text-xl font-semibold mb-4">No product found.</p>
        <Link href="/" className="text-blue-500 hover:underline">Back to Shop</Link>
      </div>
    );
  }

  const commonFields = ['id', 'name', 'price', 'image', 'category', 'description', 'stock'];

  const renderNestedProperties = (obj: any, level: number = 0) => {
    return Object.entries(obj).map(([key, value ]) => {
      const paddingLeft = `${level * 20}px`;

      return (
        <div key={key} style={{ paddingLeft }}>
          <span className="font-semibold text-gray-700 dark:text-gray-300">{key.charAt(0).toUpperCase() + key.slice(1)}: </span>
          {typeof value === 'object' && value !== null ? (
            renderNestedProperties(value, level + 1)
          ) : (
            <span className="text-gray-600 dark:text-gray-400">{value.toString()}</span>
          )}
        </div>
      );
    });
  };

  const getTimeAgo = (timestamp: string | undefined) => {
    if (!timestamp) {
      return 'Unknown time';
    }
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
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
          <div className="flex justify-between items-center mb-4">
            <Link href="/" className="text-blue-500 hover:underline inline-block">Back to Shop</Link>
          </div>
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
                  <button
                    className={`dark:text-gray-200 text-gray-600 py-2 px-4 ${activeTab === 'prices' ? 'border-b-2 border-blue-500' : ''}`}
                    onClick={() => setActiveTab('prices')}
                  >
                    Prices
                  </button>
                </div>
                <div className="mt-4">
                  {activeTab === 'description' && (
                    <p className="text-gray-600 dark:text-gray-300">{product.description || 'No description available.'}</p>
                  )}
                  {activeTab === 'specifics' && (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      {renderNestedProperties(
                        Object.fromEntries(Object.entries(product).filter(([key]) => !commonFields.includes(key)))
                      )}
                    </div>
                  )}
                  {activeTab === 'prices' && (
                    <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-2">Prices</h3>
                      {prices.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {prices.map((price, index) => (
                            <Card key={index} className="p-6">
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold">{price.name || 'Unknown'}</h3>
                                  <p className="text-2xl font-bold">${parseFloat(price.price).toFixed(2)}</p>
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {price.explain || 'No explanation provided'}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Last updated: {getTimeAgo(price.timestamp)}
                                  </p>
                                </div>
                                <Button asChild>
                                  <a
                                    href={price.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center"
                                  >
                                    Visit Site
                                    <ExternalLink className="ml-2 h-4 w-4" />
                                  </a>
                                </Button>
                              </div>
                            </Card>
                          ))}
                        </div>
                      ) : (
                        <p>No prices available for this product.</p>
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