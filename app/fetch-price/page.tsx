"use client"
import { useState } from 'react';


export default function FetchPrice() {
  const [url, setUrl] = useState('');
  const [price, setPrice] = useState(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setPrice(null);
    setExplanation('');

    try {
      const response = await fetch('/api/fetch-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Price not found for the given URL');
        } else {
          setError('Failed to fetch price');
        }
        return;
      }

      const data = await response.json();
      setPrice(data.price);
      setExplanation(data.explanation || 'No explanation provided');
    } catch (err) {
      setError('An error occurred while fetching the price');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">Fetch Product Price</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter product URL"
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
        >
          {loading ? 'Fetching...' : 'Fetch Price'}
        </button>
      </form>
      {error && <p className="text-red-500">{error}</p>}
      {price && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold">Fetched Price:</h2>
          <p className="text-2xl font-bold text-green-600">{price}</p>
          <p className="mt-2">{explanation}</p>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            Buy Now
          </a>
        </div>
      )}
    </div>
  );
}