'use client';

import { useEffect, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ShoppingCartIcon, PencilIcon } from '@heroicons/react/24/solid';
import products from '../../../public/products.json';
import priceData from '../../../public/price.json';
import { Callout } from '@/components/Callout';
import { useCart } from '@/context/CartContext';
import { useCurrentTime } from '@/hooks/useCurrentTime';
import ProductNotFind from '@/components/ProductNotFind';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ExternalLink, ShoppingCart, Star } from "lucide-react";

// import ProductManager from "@/components/ProductManager";

// interface Product {
//   id: number;
//   name: string;
//   price: number;
//   image: string;
//   category: string;
//   description?: string;
//   views: number;
//   material?: string; // فیلد اختیاری
//   sizesAvailable: string[];
//   colorsAvailable: string[];
//   careInstructions?: string; // فیلد اختیاری
//   stock?: number; // فیلد اختیاری
//   ramOptions?: { size: string; price: number }[]; // فیلد اختیاری
//   [key: string]: any; // Allow for additional properties
  
// }

interface Price {
  priceId: string;
  price: number;
  // other fields...
}

type Product = {
  id: number;
  name: string;
  price: number;
  image: string;
  views: number;
  category: string;
  description?: string;
  material?: string; // اختیاری
  sizesAvailable?: string[]; // اختیاری
  colorsAvailable?: string[];
  careInstructions?: string; // اختیاری
  stock?: number; // اختیاری
  ramOptions?: { size: string; price: number }[]; // اختیاری
  [key: string]: any; // انعطاف‌پذیری بیشتر
};

export default function ProductPage() {
  const { name } = useParams();
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
        // Check if the price entry has an 'id' field that matches the product id
        if (price.id && price.id.toString() === product?.id?.toString()) {
          return true;
        }
        // If there's no 'id' field, check if the URL includes the product name
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
  
    const hasOptions = Object.keys(product).some(key => 
      key.endsWith('Available') || key.endsWith('Options')
    );
  
    if (hasOptions) {
      // Update price for options with different prices
      Object.entries(selectedOptions).forEach(([optionName, selectedValue]) => {
        const optionKey = optionName + 'Options';
        if (product[optionKey] && Array.isArray(product[optionKey])) {
          const selectedOption = product[optionKey].find(
            (option: any) => option.size === selectedValue
          );
          if (selectedOption && selectedOption.price) {
            updatedProduct.price = selectedOption.price;
          }
        }
      });
      
      // Combine product and options into a single object
      const productWithOptions = {
        ...updatedProduct,
        selectedOptions
      };
      
      addToCart(productWithOptions);
    } else {
      const productWithOptions = {
        ...updatedProduct,
        selectedOptions: {}
      };
      addToCart(productWithOptions);
    }
    
    setShowSuccessMessage(true);
    setTimeout(() => {
      setShowSuccessMessage(false);
    }, );
  
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
  
      const foundProduct = products.find((p) => {
        const productNameNormalized = p.name?.toLowerCase()?.replace(/ /g, '-') || '';
        return decodedName === `${productNameNormalized}-${p.id}`;
      });
  
      if (foundProduct) {
        const normalizedProduct: Product = {
          ...foundProduct,
          stock: foundProduct.stock ?? 0,
          sizesAvailable: foundProduct.sizesAvailable ?? [],
          views: foundProduct.views || 0,
        };
        
        setProduct(normalizedProduct);
        setViewCount(foundProduct.views ?? 0);
        // ... rest of the code
      
      
  
        setProduct(normalizedProduct);
        setViewCount(foundProduct.views ?? 0);
  
        try {
          const response = await fetch(`/api/products/${foundProduct.id}/view`, { method: 'POST' });
          if (response.ok) {
            const updatedViewCount = await response.json();
            setViewCount(updatedViewCount.views);
          }
        } catch (error) {
          console.error('Failed to update view count:', error);
        }
      } else {
        console.error('Product not found');
      }
  
      setLoading(false);
    };
  
    fetchProduct();
  }, [name, products]);
  
  
  
  

  if (loading) {
    return <div className="text-center p-8">Loading...</div>;
  }

  if (!product) {
    return (
      <ProductNotFind/>
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
            <span className="text-gray-600 dark:text-gray-400">{value ? value.toString(): null}</span>
          )}
        </div>
      );
    });
  };

  const handleEditPrice = (price: any) => {
    if (!price) {
      console.error('No price provided for editing');
      return;
    }
    setEditingPrice({ ...price, isEditing: true, priceId: price.priceId });
    setShowEditModal(true);
  };

  const handleAddNewPrice = () => {
    setEditingPrice({ id: product.id, name: '', price: '', url: '', explain: '', isEditing: false, priceId: null });
    setShowEditModal(true);
  };

  const getTimeAgo = (timestamp: string) => {
    if (!timestamp) return 'Unknown time';
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Invalid date';
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (error) {
      return 'Invalid date';
    }
  };

  interface EditedPrice extends Price {
    // other fields specific to edited price...
  }

  const handleSavePrice = async (editedPrice: EditedPrice) => {
    try {
      const response = await fetch(`/api/prices/${editedPrice.priceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedPrice),
      });
  
      if (!response.ok) {
        throw new Error('Failed to save price');
      }
  
      const updatedPrice: Price = await response.json();
  
      // Update prices state
      setPrices((currentPrices: Price[]) =>
        currentPrices.map(p => p.priceId === editedPrice.priceId ? updatedPrice : p)
      );
  
      // Update price.json file
      const allPrices: Price[] = await fetch('/price.json').then(res => res.json());
      const updatedAllPrices = allPrices.map(p => p.priceId === editedPrice.priceId ? updatedPrice : p);
      await fetch('/api/updatePrices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedAllPrices),
      });
  
      setShowEditModal(false);
    } catch (error) {
      console.error('Error saving price:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleSaveNewPrice = async (newPrice: any) => {
    try {
      // Generate a new priceId
      const newPriceId = `price_${Date.now()}`;
      const priceWithId = { ...newPrice, priceId: newPriceId };

      const response = await fetch('/api/prices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(priceWithId),
      });

      if (!response.ok) {
        throw new Error('Failed to add new price');
      }

      const addedPrice = await response.json();
      
      // Update prices state
      setPrices(currentPrices => [...currentPrices, addedPrice]);

      // Update price.json file
      const allPrices = await fetch('/price.json').then(res => res.json());
      const updatedAllPrices = [...allPrices, addedPrice];
      await fetch('/api/updatePrices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedAllPrices),
      });

      setShowEditModal(false);
    } catch (error) {
      console.error('Error adding new price:', error);
      // Handle error (e.g., show error message to user)
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingPrice.isEditing) {
      await handleSavePrice(editingPrice);
    } else {
      await handleSaveNewPrice(editingPrice);
    }
    setShowEditModal(false);
  };

  const handleDeletePrice = async (priceId: string) => {
    try {
      const response = await fetch(`/api/prices/${priceId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete price');
      }

      // Remove the deleted price from the state
      setPrices(currentPrices => currentPrices.filter(p => p.priceId !== priceId));
      
      // Show success message
      alert('Price deleted successfully');
    } catch (error) {
      console.error('Error deleting price:', error);
      alert('Failed to delete price. Please try again.');
    }
  };

  return (
    <div className="bg-white dark:bg-black min-h-screen relative">
  {showSuccessMessage && (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-sm">
      <Callout variant="success" title="Product Added to Cart">
        The item has been successfully added to your cart.
      </Callout>
    </div>
  )}

  {showEditModal && (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div className="bg-white dark:bg-black p-6 rounded-lg w-96">
      <h2 className="text-xl font-bold mb-4">{editingPrice.isEditing ? 'Edit Price' : 'Add New Price'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Shop Name</label>
          <input
            type="text"
            value={editingPrice?.name || ''}
            onChange={(e) => setEditingPrice({...editingPrice, name: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price</label>
          <input
            type="number"
            value={editingPrice?.price || ''}
            onChange={(e) => setEditingPrice({...editingPrice, price: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">URL</label>
          <input
            type="text"
            value={editingPrice?.url || ''}
            onChange={(e) => setEditingPrice({...editingPrice, url: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Explanation</label>
          <textarea
            value={editingPrice?.explain || ''}
            onChange={(e) => setEditingPrice({...editingPrice, explain: e.target.value})}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          ></textarea>
        </div>
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setShowEditModal(false)}
            className="mr-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </form>
    </div>
    {prices.map((price, index) => (
                            <div key={price.priceId} className="border rounded-lg p-4 bg-white dark:bg-gray-800 shadow-md flex flex-col justify-between">
                              <div>
                                <h4 className="font-semibold text-lg mb-2">{price.name || 'Unknown'}</h4>
                                <p className="text-xl font-bold mb-2">${parseFloat(price.price).toFixed(2)}</p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{price.explain || 'No explanation provided'}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Last updated: {getTimeAgo(price.timestamp)}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Price ID: {price.priceId}</p>
                              </div>
                              <div className="flex justify-between items-center mt-4">
                                <a
                                  href={price.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-green-500 text-white px-4 py-2 rounded-md text-sm hover:bg-green-600 transition-colors"
                                >
                                  Buy
                                </a>
                                <div>
                                  <button
                                    onClick={() => handleEditPrice(price)}
                                    className="bg-blue-500 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-600 transition-colors mr-2"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleDeletePrice(price.priceId)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-md text-sm hover:bg-red-600 transition-colors"
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      
  
  
  )}
          <button
              onClick={handleAddNewPrice}
              className="bg-green-500 text-white px-4 py-2 rounded-md flex items-center"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Add Price
            </button>

  {/* Main Content */}
  <div className="container mx-auto px-4 py-8">
    <div className="grid lg:grid-cols-2 gap-8">
      <div className="relative aspect-square rounded-xl overflow-hidden">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover"
          priority
        />
        <Badge className="absolute top-4 left-4 bg-primary/90">
        {product.category}
        </Badge>
      </div>
     

      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold">{product.name}</h1>
          <p className="text-2xl font-semibold mt-2">${product.price}</p>
          <div className="flex items-center gap-2 mt-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-5 h-5 ${
                  i < product.rating
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
            <span className="text-sm text-muted-foreground">
              ({product.reviews} reviews)
            </span>
          </div>
        </div>

        <p className="text-lg text-muted-foreground">{product.description}</p>

        <div className="flex gap-4">
          <Button size="lg" className="w-full">
            <ShoppingCart className="mr-2 h-5 w-5" />
            Add to Cart
          </Button>
          <Button
            variant="outline"
            size="lg"
            // onClick={() => setShowManager(true)}
          >
            Manage Product
          </Button>
        </div>

        <Tabs defaultValue="specs" className="mt-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="specs">Specifications</TabsTrigger>
            <TabsTrigger value="info">Information</TabsTrigger>
            <TabsTrigger value="prices">Compare Prices</TabsTrigger>
          </TabsList>
          <TabsContent value="specs" className="mt-4">
            <Card className="p-6">
            <dl className="divide-y divide-border">
                      {renderNestedProperties(
                        // Filter out common fields and only show specifics
                        Object.fromEntries(Object.entries(product).filter(([key]) => !commonFields.includes(key)))
                      )}
              </dl>
            </Card>
          </TabsContent>
          <TabsContent value="info" className="mt-4">
            <Card className="p-6">
              <div className="prose prose-neutral dark:prose-invert">
                {product.additionalInfo}
              </div>
            </Card>
          </TabsContent>
          <TabsContent value="prices" className="mt-4">
          {prices.length > 0 ? (
            <div className="grid gap-4">
               {prices.map((price, i) => (
              
                <Card key={i} className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{price.name}</h3>
                      <p className="text-2xl font-bold">${price.price}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {price.explain}
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
          </TabsContent>
        </Tabs>
      </div>
    </div>

    {/* {showManager && (
      <ProductManager
        product={product}
        onClose={() => setShowManager(false)}
        onSave={(updatedProduct) => {
          setProduct(updatedProduct);
          setShowManager(false);
        }}
      />
    )} */}
  </div>
</div>

  );
}
