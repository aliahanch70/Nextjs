'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import CategorySelector from './CategorySelector';
import PriceSlider from './Slider';

interface User {
  username: string;
  role: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image: string; // Image is now a URL, not a File
  category: string;
  owner: string; // Username of the owner who added the product
}

const initialNewProduct = { name: '', price: 0, category: '', image: '' };

interface DashboardClientProps {
  user: User | null;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState(initialNewProduct);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  // Fetch products from your JSON file
  useEffect(() => {
    fetch('/products.json')
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        const prices = data.map((product: Product) => product.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        setPriceRange([minPrice, maxPrice]);
      });
  }, []);

  const handlePriceChange = (values: [number, number]) => {
    // Handle price change logic here
    console.log('Price range changed:', values);
  };

  // Handle image file selection for new or editing product
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    setImageFile(file);
  };

  // Upload the image to the server (this could be a separate API or part of the add/edit API)
  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    const formData = new FormData();
    formData.append('file', imageFile);

    try {
      const response = await fetch('/api/imageUpload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        return result.filePath; // The uploaded image URL
      } else {
        console.error('Image upload failed');
        return null;
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  // Handle adding a new product
  const handleAddProduct = async () => {
    if (!user) return; // Ensure user is logged in
    const imageUrl = await uploadImage(); // Upload the image and get its URL
    if (!imageUrl) return;

    const newId = products.length ? products[products.length - 1].id + 1 : 1;
    const newProductData = { 
      id: newId, 
      ...newProduct, 
      image: imageUrl, 
      owner: user.username // Set the logged-in user as the owner
    };

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newProductData),
    });

    if (response.ok) {
      setProducts([...products, newProductData]);
      setNewProduct(initialNewProduct); // Clear form after adding
      setImageFile(null); // Reset image file input
    }
  };

  // Handle editing an existing product
  const handleEditProduct = async () => {
    if (!editingProduct) return;

    const imageUrl = imageFile ? await uploadImage() : editingProduct.image; // Either upload a new image or keep the current one
    const updatedProduct = { ...editingProduct, image: imageUrl };

    const response = await fetch('/api/products', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedProduct),
    });

    if (response.ok) {
      const updatedProducts = products.map((prod) =>
        prod.id === editingProduct.id ? updatedProduct : prod
      );
      setProducts(updatedProducts);
      setEditingProduct(null); // Clear edit state after updating
      setImageFile(null); // Reset image file input
    }
  };

  const handleCategoryChange = (category: string) => {
    setNewProduct({ ...newProduct, category });
  };

  const handleDeleteProduct = async (id: number) => {
    try {
      const response = await fetch(`/api/delete/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedProducts = products.filter((prod) => prod.id !== id);
        setProducts(updatedProducts);
      } else {
        console.error('Failed to delete product');
      }
    } catch (error) {
      console.error('Error during product deletion:', error);
    }
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
  };

  return (
    <div className="min-h-screen flex">
      <Layout user={user} children={undefined} />

      <div className="flex-1 bg-white dark:bg-gray-900 p-8">
        {user ? (
          <>
            <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
              Welcome, {user.username}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-4">
              You are logged in as {user.username}.
            </p>

            {/* Display Product List */}
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mt-8">Product List</h2>
            <ul className="mt-4">
              {products.map((product) => (
                <li key={product.id} className="mb-2 text-gray-700 dark:text-gray-300">
                  {product.name} - ${product.price} - {product.category} - {product.owner}
                  <div>
                    <img src={product.image} alt={product.name} className="max-w-32	 mt-2" />
                    <button
                      onClick={() => handleEditClick(product)}
                      className="ml-2 text-blue-500"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="ml-2 text-red-500"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            {/* Add New Product */}
            <div className="mt-6 mb-12">
              <h2 className="text-xl font-semibold">Add New Product</h2>
              <input
                type="text"
                placeholder="Product Name"
                value={newProduct.name}
                onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                className="border p-2 rounded mr-2"
              />
              <input
                type="number"
                placeholder="Product Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: parseFloat(e.target.value) })}
                className="border p-2 rounded mr-2"
              />
              <div className="mt-2">
              <CategorySelector
                value={newProduct.category}
                onChange={handleCategoryChange}
              />
              </div>
              <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />

              <button
                onClick={handleAddProduct}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                Add Product
              </button>
            </div>

            {/* Price Slider */}
            <div className="mt-6">
              <h2 className="text-xl font-semibold">Filter by Price</h2>
              <PriceSlider
                min={priceRange[0]}
                max={priceRange[1]}
                onChange={handlePriceChange}
              />
            </div>

            {/* Edit Product Section */}
            {editingProduct && (
              <div className="mt-6">
                <h2 className="text-xl font-semibold">Edit Product</h2>
                <input
                  type="text"
                  placeholder="Product Name"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="border p-2 rounded mr-2"
                />
                <input
                  type="number"
                  placeholder="Product Price"
                  value={editingProduct.price}
                  onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                  className="border p-2 rounded mr-2"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={editingProduct.category}
                  onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                  className="border p-2 rounded mr-2"
                />
                <input type="file" accept="image/*" onChange={handleImageChange} className="mb-2" />

                <button
                  onClick={handleEditProduct}
                  className="bg-blue-500 text-white px-4 py-2 rounded"
                >
                  Update Product
                </button>
              </div>
            )}
          </>
        ) : (
          <h1 className="text-3xl font-semibold text-gray-800 dark:text-gray-100">
            Welcome, Guest!
          </h1>
        )}
      </div>
    </div>
  );
}
