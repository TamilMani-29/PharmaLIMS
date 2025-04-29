import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, FlaskRound } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import App from '../../App';

export default function ProductDetails() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { products } = useProducts();

  const product = products.find(p => p.id === productId);
  if (!product) return null;

  return (
    <div>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 px-4">
        <div className="h-full flex items-center justify-between">
          <div className="flex items-center">
          <button
            onClick={() => navigate('/products')}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">{product.name}</h1>
              <p className="text-sm text-gray-500">{product.id}</p>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center mr-8">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white mr-2">
                <FlaskRound className="w-5 h-5" />
              </div>
              <span className="text-lg font-semibold text-gray-900">LabFlow</span>
            </div>
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?fit=facearea&facepad=2&w=256&h=256&q=80"
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div>
        <App productId={productId} />
      </div>
    </div>
  );
}