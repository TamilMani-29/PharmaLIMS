import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, X, FlaskRound as Flask, Beaker, TestTube2 } from 'lucide-react';
import { useProducts, Product, ProductStatus } from '../../context/ProductContext';
import { useSamples } from '../../context/SampleContext';
import { useTests } from '../../context/TestContext';
import NewProductModal from './modals/NewProductModal';

interface FilterState {
  status: ProductStatus[];
  search: string;
}

export default function ProductList() {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { samples } = useSamples();
  const { tests } = useTests();
  const [showNewModal, setShowNewModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    search: ''
  });

  const filteredProducts = products.filter(product => {
    const matchesStatus = filters.status.length === 0 || filters.status.includes(product.status);
    const matchesSearch = !filters.search || 
      product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      product.description.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: ProductStatus) => {
    switch (status) {
      case 'not_started':
        return 'bg-gray-100 text-gray-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {filters.status.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                {filters.status.length}
              </span>
            )}
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search products..."
              className="pl-9 pr-4 py-2 w-[300px] text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Product
          </button>
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/products/${product.id}`)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{product.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">{product.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(product.status)}`}>
                  {product.status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <TestTube2 className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-sm font-medium text-gray-900">{product.sampleIds.length}</span>
                  <span className="text-xs text-gray-500">Samples</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Beaker className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-sm font-medium text-gray-900">{product.testIds.length}</span>
                  <span className="text-xs text-gray-500">Tests</span>
                </div>
                <div className="flex flex-col items-center p-3 bg-gray-50 rounded-lg">
                  <Flask className="w-5 h-5 text-blue-600 mb-1" />
                  <span className="text-sm font-medium text-gray-900">
                    {tests.filter(t => product.testIds.includes(t.id) && t.status === 'Completed').length}
                  </span>
                  <span className="text-xs text-gray-500">Completed</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>Created {new Date(product.createdAt).toLocaleDateString()}</span>
                  <span>Updated {new Date(product.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Product Modal */}
      <NewProductModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
      />

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-lg shadow-xl w-[400px]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filter Products</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Status</h3>
              <div className="space-y-3">
                {(['not_started', 'in_progress', 'completed'] as ProductStatus[]).map(status => (
                  <label key={status} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters(prev => ({
                            ...prev,
                            status: [...prev.status, status]
                          }));
                        } else {
                          setFilters(prev => ({
                            ...prev,
                            status: prev.status.filter(s => s !== status)
                          }));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">
                      {status.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setFilters({ status: [], search: '' });
                  setShowFilters(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 mr-3"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}