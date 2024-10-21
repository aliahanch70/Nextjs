"use client";
import { useState, useEffect, useRef } from 'react';
import { Switch } from '@headlessui/react';
import { SunIcon, MoonIcon, ShoppingCartIcon, Bars3Icon } from '@heroicons/react/24/solid';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { usePathname, useRouter } from 'next/navigation';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const { cart: cartItems, removeFromCart } = useCart();
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState<boolean>(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearchResultsVisible, setIsSearchResultsVisible] = useState<boolean>(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleOpenCartSidebar = () => {
      setIsRightSidebarOpen(true);
    };

    window.addEventListener('openCartSidebar', handleOpenCartSidebar);

    return () => {
      window.removeEventListener('openCartSidebar', handleOpenCartSidebar);
    };
  }, []);

  const closeSidebars = () => {
    setIsLeftSidebarOpen(false);
    setIsRightSidebarOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isOutsideSidebar = !target.closest('.sidebar');
      const isOutsideButton = !target.closest('button');
      const isOutsideNav = !target.closest('nav');

      if (isOutsideSidebar && isOutsideButton && isOutsideNav) {
        setIsLeftSidebarOpen(false);
        setIsRightSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside, true);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside, true);
    };
  }, []);

  useEffect(() => {
    if (isRightSidebarOpen) {
      setIsLeftSidebarOpen(false);
    } else if (isLeftSidebarOpen) {
      setIsRightSidebarOpen(false);
    }
  }, [isRightSidebarOpen, isLeftSidebarOpen]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setIsSearchResultsVisible(false);
      return;
    }
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data: Product[] = await response.json();
      setSearchResults(data.slice(0, 3));
      setIsSearchResultsVisible(true);
    } catch (error) {
      console.error('Error searching products:', error);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
  };

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchResultsVisible(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setIsRightSidebarOpen(false);
    setIsLeftSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-mg z-50">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        {/* Left Section - Hamburger Menu for Mobile */}
        <div className="md:hidden">
          <button onClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} className="text-gray-900 dark:text-white">
            <Bars3Icon className="h-6 w-6" />
          </button>
        </div>

        {/* Left Section - Home and Category Dropdown for Desktop */}
        <div className="hidden md:flex items-center space-x-4">
          <a href="/" className="text-gray-900 dark:text-white font-semibold">Home</a>
          <div className="relative group">
            <button className="text-gray-900 dark:text-white font-semibold">
              Categories
            </button>
            <div className="absolute mt-2 hidden group-hover:block bg-white dark:bg-gray-800 shadow-lg rounded-md py-2 w-48 border-slate-100">
              <a href="/category/electronics" className="block px-4 py-2 text-gray-900 dark:text-white">Electronics</a>
              <a href="/category/fashion" className="block px-4 py-2 text-gray-900 dark:text-white">Fashion</a>
              {/* Add more categories as needed */}
            </div>
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-grow mx-4">
          <div ref={searchRef} className="relative">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onClick={() => setIsSearchResultsVisible(true)}
              />
              <button type="submit" className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300">
                🔍
              </button>
            </form>
            {isSearchResultsVisible && searchResults.length > 0 && (
              <div className="absolute mt-1 w-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg z-10">
                {searchResults.map((result) => (
                  <Link key={result.id} href={`/product/${encodeURIComponent(result.name.toLowerCase().replace(/ /g, '-'))}-${result.id}`} className="block">
                    <div className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                      <img src={result.image} alt={result.name} className="w-12 h-12 object-cover mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{result.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">${result.price}</div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Dark/Light Mode Switch and Cart Icon */}
        <div className="flex items-center space-x-4">
          <Switch
            checked={isDarkMode}
            onChange={setIsDarkMode}
            className={`${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
            } relative inline-flex h-6 w-12 items-center rounded-full`}
          >
            <span className="sr-only">Toggle dark/light mode</span>
            <span
              className={`${
                isDarkMode ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
          {isDarkMode ? (
            <MoonIcon className="h-6 w-6 text-yellow-500" />
          ) : (
            <SunIcon className="h-6 w-6 text-yellow-500" />
          )}
          <div className="relative">
            <button onClick={() => setIsRightSidebarOpen(!isRightSidebarOpen)} className="text-gray-900 dark:text-white">
              <ShoppingCartIcon className="h-6 w-6" />
              {cartItems.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                  {cartItems.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Left Sidebar */}
      {isLeftSidebarOpen && (
        <div className="sidebar fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 shadow-xl z-50 transition-transform transform translate-x-0">
          <div className="p-4">
            <h3 className="text-gray-900 dark:text-white text-lg font-semibold mb-4">Menu</h3>
            <ul>
              <li><a href="/" className="block py-2 text-gray-900 dark:text-white">Home</a></li>
              <li><a href="/categories" className="block py-2 text-gray-900 dark:text-white">Categories</a></li>
              <li><a href="/profile" className="block py-2 text-gray-900 dark:text-white">Profile</a></li>
              <li><a href="/about" className="block py-2 text-gray-900 dark:text-white">About Us</a></li>
              <li><a href="/contact" className="block py-2 text-gray-900 dark:text-white">Contact</a></li>
            </ul>
          </div>
          <button
            onClick={() => setIsLeftSidebarOpen(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}

      {/* Right Sidebar */}
      {isRightSidebarOpen && (
        <div className="sidebar fixed inset-y-0 right-0 w-64 bg-white dark:bg-gray-800 shadow-xl z-50 transition-transform transform translate-x-0">
          <div className="p-4">
            <h3 className="text-gray-900 dark:text-white text-lg font-semibold mb-4">Cart Items</h3>
            {cartItems.length === 0 ? (
              <p className="text-gray-500">Your cart is empty</p>
            ) : (
              <>
                {cartItems.map((item) => (
                  <div key={item.id} className="flex flex-col mb-2">
                    <span className="text-gray-900 dark:text-white text-sm">{item.name}</span>
                    {item.selectedOptions && Object.entries(item.selectedOptions).map(([key, value]) => (
                      <span key={key} className="text-gray-600 dark:text-gray-400 text-xs">{key}: {value}</span>
                    ))}
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-900 dark:text-white text-sm font-bold">${item.price.toFixed(2)}</span>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}
               <button
                  className="mt-4 block w-full text-center bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                  onClick={async (e) => {
                    e.stopPropagation();
                    await router.push('/cart', undefined, { shallow: true });
                    setIsRightSidebarOpen(true);
                  }}
                >
                  View Cart
                </button>
              </>
            )}
          </div>
          <button
            onClick={() => setIsRightSidebarOpen(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
