'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

import { useCart } from '../../context/CartContext';

export default function CartPage() {
  const { cart, removeFromCart } = useCart();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    // Keep the sidebar open when navigating to the cart page
    const event = new CustomEvent('openCartSidebar');
    window.dispatchEvent(event);
  }, []);

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // Ensure the component is mounted before rendering to avoid hydration issues
  if (!isMounted) {
    return null;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Cart</h1>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} className="flex items-center justify-between border-b py-2">
              <div className="flex items-center">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover mr-4" />
                <div>
                  <h2 className="text-lg font-semibold">{item.name}</h2>
                  <p className="text-gray-600">${item.price.toFixed(2)}</p>
                  {item.selectedOptions && Object.entries(item.selectedOptions).map(([key, value]) => (
                    <p key={key} className="text-sm text-gray-500">{key}: {value}</p>
                  ))}
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-red-500 hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <div className="mt-4">
            <p className="text-xl font-bold">Total: ${total.toFixed(2)}</p>
          </div>
        </>
      )}
      <Link href="/" className="mt-4 inline-block text-blue-500 hover:underline">
        Continue Shopping
      </Link>
    </div>
  );
}