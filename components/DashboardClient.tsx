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
  image: string;
  category: string;
  owner: string;
  specific?: string;
  optionTypes?: ProductOptionType[];
}

interface ProductOptionType {
  name: string;
  options: ProductOption[];
}

interface ProductOption {
  size: string;
  price: number;
}

const initialNewProduct = { name: '', price: 0, category: '', image: '', specific: '', options: [] };

interface DashboardClientProps {
  user: User | null;
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [newProduct, setNewProduct] = useState(initialNewProduct);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingOption, setEditingOption] = useState<ProductOption | null>(null);
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

    const imageUrl = imageFile ? await uploadImage() : editingProduct.image;
    
    // Create the new option structure
    const newOptions = {};
    if (editingProduct.optionTypes) {
      editingProduct.optionTypes.forEach(optionType => {
        const key = `${optionType.name.toLowerCase()}Options`;
        newOptions[key] = optionType.options.map(option => ({
          size: option.size,
          price: option.price
        }));
      });
    }

    const updatedProduct = { 
      ...editingProduct, 
      image: imageUrl,
      specific: editingProduct.specific || undefined,
      optionTypes: editingProduct.optionTypes && editingProduct.optionTypes.length > 0 ? editingProduct.optionTypes : undefined,
      ...newOptions  // Add the new option structure
    };

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
      setEditingProduct(null);
      setImageFile(null);
    } else {
      console.error('Failed to update product');
      // You might want to add some error handling here, e.g., showing an error message to the user
    }
  };

  const handleAddOptionType = () => {
    if (!editingProduct) return;
    const newOptionType: ProductOptionType = { name: '', options: [] };
    setEditingProduct({
      ...editingProduct,
      optionTypes: [...(editingProduct.optionTypes || []), newOptionType],
    });
  };

  const createOptionArray = (name: string, options: ProductOption[]) => {
    const key = `${name.toLowerCase()}Options`;
    return { [key]: options };
  };

  const handleAddOption = (optionTypeIndex: number) => {
    if (!editingProduct) return;
    const newOption: ProductOption = { size: '', price: 0 };
    const updatedOptionTypes = editingProduct.optionTypes ? [...editingProduct.optionTypes] : [];
    updatedOptionTypes[optionTypeIndex].options.push(newOption);
    
    const optionTypeName = updatedOptionTypes[optionTypeIndex].name.toLowerCase();
    
    setEditingProduct({
      ...editingProduct,
      optionTypes: updatedOptionTypes,
      [`${optionTypeName}Options`]: updatedOptionTypes[optionTypeIndex].options
    });
  };

  const handleUpdateOptionType = (index: number, field: keyof ProductOptionType, value: string | ProductOption[]) => {
    if (!editingProduct) return;
    const updatedOptionTypes = editingProduct.optionTypes ? [...editingProduct.optionTypes] : [];
    const oldName = updatedOptionTypes[index].name.toLowerCase();
    updatedOptionTypes[index] = { ...updatedOptionTypes[index], [field]: value };
    const newName = updatedOptionTypes[index].name.toLowerCase();
    
    const updatedProduct = { ...editingProduct, optionTypes: updatedOptionTypes };
    if (field === 'name' && oldName !== newName) {
      const oldKey = `${oldName}Options`;
      const newKey = `${newName}Options`;
      updatedProduct[newKey] = updatedProduct[oldKey];
      delete updatedProduct[oldKey];
    }
    
    setEditingProduct(updatedProduct);
  };

  const handleUpdateOption = (optionTypeIndex: number, optionIndex: number, field: keyof ProductOption, value: string | number) => {
    if (!editingProduct) return;
    const updatedOptionTypes = editingProduct.optionTypes ? [...editingProduct.optionTypes] : [];
    updatedOptionTypes[optionTypeIndex].options[optionIndex] = { 
      ...updatedOptionTypes[optionTypeIndex].options[optionIndex], 
      [field]: field === 'price' ? Number(value) : value 
    };
    
    const optionTypeName = updatedOptionTypes[optionTypeIndex].name.toLowerCase();
    
    setEditingProduct({
      ...editingProduct,
      optionTypes: updatedOptionTypes,
      [`${optionTypeName}Options`]: updatedOptionTypes[optionTypeIndex].options
    });
  };

  const handleDeleteOptionType = (index: number) => {
    if (!editingProduct) return;
    const updatedOptionTypes = editingProduct.optionTypes ? [...editingProduct.optionTypes] : [];
    const deletedOptionType = updatedOptionTypes[index];
    updatedOptionTypes.splice(index, 1);
    const updatedProduct = { ...editingProduct, optionTypes: updatedOptionTypes };
    delete updatedProduct[`${deletedOptionType.name.toLowerCase()}Options`];
    setEditingProduct(updatedProduct);
  };

  const handleDeleteOption = (optionTypeIndex: number, optionIndex: number) => {
    if (!editingProduct) return;
    const updatedOptionTypes = editingProduct.optionTypes ? [...editingProduct.optionTypes] : [];
    updatedOptionTypes[optionTypeIndex].options.splice(optionIndex, 1);
    
    const optionTypeName = updatedOptionTypes[optionTypeIndex].name.toLowerCase();
    
    setEditingProduct({
      ...editingProduct,
      optionTypes: updatedOptionTypes,
      [`${optionTypeName}Options`]: updatedOptionTypes[optionTypeIndex].options
    });
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
      <Layout user={user}  ></Layout>

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
                <li key={product.id} className="mb-4 p-4 border rounded-lg text-gray-700 dark:text-gray-300">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{product.name}</h3>
                      <p>Price: ${product.price}</p>
                      <p>Category: {product.category}</p>
                      <p>Owner: {product.owner}</p>
                      {product.specific && <p>Specific: {product.specific}</p>}
                      <div className="mt-2">
                        {product.specific && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full mr-2">
                            Has Specific
                          </span>
                        )}
                        {product.optionTypes && product.optionTypes.length > 0 && (
                          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                            Has Option Types
                          </span>
                        )}
                        {product.optionTypes && product.optionTypes.map((optionType, index) => {
                          const optionKey = `${optionType.name.toLowerCase()}Options`;
                          return (
                            <div key={index} className="mt-2">
                              <strong>{optionType.name}:</strong>
                              <ul className="list-disc list-inside">
                                {product[optionKey] && product[optionKey].map((option, optIndex) => (
                                  <li key={optIndex}>
                                    {option.size} - ${option.price}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <img src={product.image} alt={product.name} className="w-24 h-24 object-cover rounded" />
                  </div>
                  <div className="mt-2">
                    <button
                      onClick={() => handleEditClick(product)}
                      className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded"
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
              <div className="mt-6 bg-gray-100 p-4 rounded-lg">
                <h2 className="text-xl font-semibold mb-4">Edit Product</h2>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Product Name"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="border p-2 rounded"
                  />
                  <input
                    type="number"
                    placeholder="Product Price"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) })}
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Category"
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="border p-2 rounded"
                  />
                  <input
                    type="text"
                    placeholder="Specific"
                    value={editingProduct.specific || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, specific: e.target.value })}
                    className="border p-2 rounded"
                  />
                </div>
                <input type="file" accept="image/*" onChange={handleImageChange} className="mt-4" />

                <h3 className="text-lg font-semibold mt-6 mb-2">Product Option Types</h3>
                {editingProduct.optionTypes && editingProduct.optionTypes.map((optionType, typeIndex) => (
                  <div key={typeIndex} className="mt-4 border-t pt-4">
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="Option Type Name"
                        value={optionType.name}
                        onChange={(e) => handleUpdateOptionType(typeIndex, 'name', e.target.value)}
                        className="border p-2 rounded mr-2 flex-grow"
                      />
                      <button
                        onClick={() => handleDeleteOptionType(typeIndex)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Delete Type
                      </button>
                    </div>
                    {optionType.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="flex items-center mt-2">
                        <input
                          type="text"
                          placeholder="Size"
                          value={option.size}
                          onChange={(e) => handleUpdateOption(typeIndex, optionIndex, 'size', e.target.value)}
                          className="border p-2 rounded mr-2 flex-grow"
                        />
                        <input
                          type="text"
                          placeholder="Size"
                          value={option.size || ''}
                          onChange={(e) => handleUpdateOption(typeIndex, optionIndex, 'size', e.target.value)}
                          className="border p-2 rounded mr-2 w-24"
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          value={option.price}
                          onChange={(e) => handleUpdateOption(typeIndex, optionIndex, 'price', parseFloat(e.target.value))}
                          className="border p-2 rounded mr-2 w-24"
                        />
                        <button
                          onClick={() => handleDeleteOption(typeIndex, optionIndex)}
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => handleAddOption(typeIndex)}
                      className="bg-green-500 text-white px-4 py-2 rounded mt-2"
                    >
                      Add Option
                    </button>
                  </div>
                ))}
                <button
                  onClick={handleAddOptionType}
                  className="bg-green-500 text-white px-4 py-2 rounded mt-4"
                >
                  Add Option Type
                </button>

                <div className="mt-6">
                  <button
                    onClick={handleEditProduct}
                    className="bg-blue-500 text-white px-6 py-2 rounded"
                  >
                    Update Product
                  </button>
                </div>
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
