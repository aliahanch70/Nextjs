'use client';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingCartIcon, PencilIcon } from '@heroicons/react/24/solid';
import { useCart } from '@/context/CartContext';
import { user } from "@nextui-org/react";

// Define the Product interface
interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  description?: string;
  stock: number;
  [key: string]: any;
}

export default function ProductPage({ params }: { params: { name: string } }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('description');
  const [viewCount, setViewCount] = useState<number | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string }>({});
  const { addToCart } = useCart();

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        // Fetch the product data from your API
        const response = await fetch(`/api/product2/${params.name}`);
        if (!response.ok) {
          throw new Error('Product not found');
        }
        const data = await response.json();
        setProduct(data);
        setViewCount(data.views || 0);


        // Update view count
        await fetch(`/api/product22/${data.id}/view`, { method: 'POST' });
      } catch (error) {
        console.error('Error fetching product:', error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.name]);

  // Fetch prices
  useEffect(() => {
    const fetchPrices = async () => {
      if (!product?.id) return;
      
      try {
        const response = await fetch(`/api/prices/${product.id}`);
        if (response.ok) {
          const data = await response.json();
          setPrices(data);
        }
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();
  }, [product]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, selectedOptions);
    setShowSuccessMessage(true);
    setTimeout(() => setShowSuccessMessage(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Product Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 min-h-screen">
      <div className="container mx-auto p-4">
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          <div className="mb-6">
            <Link 
              href="/"
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center"
            >
              ← Back to Shop
            </Link>
          </div>

          {/* Product Details */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="md:flex">
              {/* Product Image */}
              <div className="md:flex-shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-96 w-full object-cover md:w-96"
                />
              </div>

              {/* Product Info */}
              <div className="p-8">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {product.name}
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      {product.category}
                    </p>
                  </div>
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${product.price.toFixed(2)}
                  </p>
                </div>

                <div className="mt-4">
                  <div className="flex items-center">
                    <span className="text-gray-600 dark:text-gray-400">
                      Stock: {product.stock}
                    </span>
                    <span className="mx-4 text-gray-300">|</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      Views: {viewCount}
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Description
                  </h3>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">
                    {product.description || 'No description available.'}
                  </p>
                </div>

                <div className="mt-8">
                  <Button
                    onClick={() => handleAddToCart(product)}
                    className="w-full"
                    disabled={product.stock === 0}
                  >
                    <ShoppingCartIcon className="w-5 h-5 mr-2" />
                    {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Prices Section */}
          {prices.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Available Prices
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {prices.map((price, index) => (
                  <Card key={index} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{price.name || 'Unknown'}</h3>
                        <p className="text-2xl font-bold">
                          ${parseFloat(price.price).toFixed(2)}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {price.explain || 'No explanation provided'}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
