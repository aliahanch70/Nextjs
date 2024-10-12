"use client"
import { useState, useEffect } from 'react';
import { Switch } from '@headlessui/react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/solid'; // Correct import for v2

const Navbar = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        
        {/* Left Section - Home and Category Dropdown */}
        <div className="flex items-center space-x-4">
          <a href="/" className="text-gray-900 dark:text-white font-semibold">Home</a>

          <div className="relative group">
            <button className="text-gray-900 dark:text-white font-semibold">
              Categories
            </button>
            <div className="absolute mt-2 hidden group-hover:block bg-white dark:bg-gray-800 shadow-lg rounded-md py-2 w-48">
              <a href="/category/electronics" className="block px-4 py-2 text-gray-900 dark:text-white">Electronics</a>
              <a href="/category/fashion" className="block px-4 py-2 text-gray-900 dark:text-white">Fashion</a>
              {/* Add more categories as needed */}
            </div>
          </div>
        </div>

        {/* Center Section - Search Bar */}
        <div className="flex-grow mx-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md dark:bg-gray-800 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-300">
              🔍
            </button>
          </div>
        </div>

        {/* Right Section - Dark/Light Mode Switch */}
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
            <MoonIcon className="h-6 w-6 text-yellow-500" /> // Corrected import from Heroicons v2
          ) : (
            <SunIcon className="h-6 w-6 text-yellow-500" />  // Corrected import from Heroicons v2
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
