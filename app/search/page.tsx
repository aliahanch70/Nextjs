"use client"
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function SearchPage() {
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (query) {
        try {
          setIsLoading(true);
          setError(null);
          const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
          const responseText = await response.text();
          console.log('Full response:', responseText);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}, response: ${responseText}`);
          }
          const data = JSON.parse(responseText);
          setSearchResults(data);
        } catch (error) {
          console.error('Error fetching search results:', error);
          setError(error.message);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : searchResults.length === 0 ? (
        <p>No results found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((result) => (
            <Link key={result.id} href={`/product/${encodeURIComponent(result.name.toLowerCase().replace(/ /g, '-'))}-${result.id}`}>
              <div className="border p-4 rounded-md hover:shadow-lg transition-shadow duration-200">
                <img src={result.image} alt={result.name} className="w-full h-48 object-cover mb-2" />
                <h2 className="text-lg font-semibold">{result.name}</h2>
                <p className="text-gray-600">${result.price.toFixed(2)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}