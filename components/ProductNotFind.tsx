import Link from "next/link";

const ProductNotFind: React.FC = () => {
  return (
    <div className="text-center p-8">
        <p className="text-xl font-semibold mb-4">Sorry, we couldn't find the product you're looking for.</p>
        <p className="mb-4">This might be because:</p>
        <ul className="list-disc list-inside mb-4">
          <li>The product name or ID in the URL might be incorrect</li>
          <li>The product might have been removed from our catalog</li>
        </ul>
        <p className="mb-4">You can try:</p>
        <ul className="list-disc list-inside mb-4">
          <li>Double-checking the URL</li>
          <li>Searching for the product on our main page</li>
          <li>Browsing our categories to find similar products</li>
        </ul>
        <Link href="/" className="text-blue-500 hover:underline">Back to Shop</Link>
      </div>
  );
};

export default ProductNotFind;
