'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // For redirecting
import { deleteCookie } from 'cookies-next'; // You may need to install this package
import { Callout } from './Callout';

interface User {
  username: string;
}

interface LayoutProps {
  user: User | null; // Layout expects the user prop
  children: React.ReactNode;
}

export default function Layout({ user }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(true);
  const [showCallout, setShowCallout] = useState(false);
  const router = useRouter();

  // Load dark mode preference from localStorage
  useEffect(() => {
    // Set dark mode as default
    setDarkMode(true);
    document.documentElement.classList.add('dark');
    localStorage.setItem('darkMode', 'true');
  }, []);

  // Update dark mode based on state
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  }, [darkMode]);

    
    // Redirect to login or home page
    const handleLogout = async () => {
      try {
        // Call the API route to clear the JWT token cookie
        await fetch('/api/logout', { method: 'GET' });
        setShowCallout(true);

        // Refresh the page to reflect the logout
        router.refresh();
        setTimeout(() => {
          setShowCallout(false);
          router.refresh();  // Refresh the page to apply the logout effect
        }, 2000); // 2 second 

      } catch (error) {
        console.error('Failed to log out:', error);
      }
    };  
    const handleLogin =  () => {
      
        router.push('/login');
     
    }; 

      

  return (
    <div className="min-h-screen flex">
      {/* Sidebar with Dark Mode Toggle */}
      <div className="w-64 bg-gray-200 dark:bg-gray-800 p-4">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Dashboard</h2>
        <nav>
          <ul>
            <li className="mb-2">
              <a href="/" className="text-gray-600 dark:text-gray-300">Home</a>
            </li>
            <li className="mb-2">
              <a href="/settings" className="text-gray-600 dark:text-gray-300">Settings</a>
            </li>
            <li className="mb-2">
              <a href="/profile" className="text-gray-600 dark:text-gray-300">Profile</a>
            </li>
          </ul>
        </nav>

        {/* Dark Mode Toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-yellow-500 dark:hover:bg-yellow-600"
        >
          Toggle {darkMode ? 'Light' : 'Dark'} Mode
        </button>

        {/* Logout Button */}
        
        {user ? <button
          onClick={handleLogout}
          className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Logout
        </button> : 
        <button
        onClick={handleLogin}
          className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
         >
          login
         </button>}
         {showCallout && (
          <Callout variant="warning" title="Warning" className='mt-4'>
            You logged out !
          </Callout>
        )}
      </div>


      {/* Main Content */}
      <div className="flex-1 bg-white dark:bg-gray-900 p-8">
        {/* {children} */}
         {/* Conditionally display the Callout */}
         
      </div>
    </div>
  );
}
