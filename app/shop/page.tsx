import Link from 'next/link';
import { Camera } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-center mb-12">
          <Camera className="w-12 h-12 text-blue-600 mr-4" />
          <h1 className="text-4xl font-bold text-gray-900">TechStore Admin</h1>
        </div>
        <div className="grid gap-8 max-w-2xl mx-auto">
          <Link 
            href="/products"
            className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">View Products</h2>
            <p className="text-gray-600">Browse and manage your product catalog</p>
          </Link>
          <Link 
            href="/products/manage"
            className="block p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Product Management</h2>
            <p className="text-gray-600">Add, edit, or remove products from your store</p>
          </Link>
        </div>
      </div>
    </main>
  );
}