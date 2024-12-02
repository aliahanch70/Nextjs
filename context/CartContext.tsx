import React, { createContext, useState, useContext, useEffect } from 'react';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  storageOptions?: Array<{ size: string; price: number }>;
  selectedOptions: {
    size?: string;
    color?: string;
    storage?: string;
    ram?: string;
  };
}

interface CartContextType {
  cart: Product[];
  addToCart: (product: {
      [p: string]: any;
      image: string;
      ramOptions?: { size: string; price: number }[];
      colorsAvailable?: string[];
      sizesAvailable?: string[];
      careInstructions?: string;
      description?: string;
      material?: string;
      price: number;
      name: string;
      selectedOptions: { [p: string]: string };
      id: number;
      category: string;
      stock?: number;
      views: number
  }) => void;
  removeFromCart: (productId: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [cart, setCart] = useState<Product[]>([]);

  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const newCart = [...prevCart, product];
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => {
      const newCart = prevCart.filter(item => item.id !== productId);
      localStorage.setItem('cart', JSON.stringify(newCart));
      return newCart;
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};