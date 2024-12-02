'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSignup = async () => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (data.message === 'User created successfully') {
      router.push('/login');
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center dark" >
    <form onSubmit={handleSignup} className="bg-white p-6 rounded shadow-md w-96">
      <h2 className="text-2xl font-bold mb-4">Signup</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Username</label>
        <input
          type="text"
          placeholder="Username"
          value={username}
          className="mt-1 block w-full p-2 border border-gray-300 rounded"
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>

      <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700">Password</label>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full p-2 border border-gray-300 rounded"
          required
        />
      </div>
       <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-"
        >
          Signup
        </button >
        <div className='mt-6'>
          Or <Link href="/login" className=" text-blue-500 hover:text-blue-600">Login</Link>
         </div>
      {error && <p>{error}</p>}
      </form>
    </div>
  );
}
