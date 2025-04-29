import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, X, ClipboardList, Beaker, Trash2, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useSpecifications, SpecificationStatus } from '../../context/SpecificationContext';
import { useProducts } from '../../context/ProductContext';
import { useTests } from '../../context/TestContext';
import AddSpecificationModal from './modals/AddSpecificationModal';
import NewSpecificationModal from './modals/NewSpecificationModal';
import GuidedWorkflow from './onboarding/GuidedWorkflow';

interface FilterState {
  status: SpecificationStatus[];
  search: string;
}

interface SpecificationListProps {
  productId: string;
}

// Helper function to calculate and render specification results
function renderSpecificationResults(spec, tests) {
  // Get all linked tests for this specification
  const linkedTests = tests.filter(test => spec.linkedTestIds.includes(test.id));
  const completedTests = linkedTests.filter(test => test.status === 'Completed');
  
  // If no tests are linked or completed, show pending
  if (linkedTests.length === 0 || completedTests.length === 0) {
    return (
      <div className="flex items-center">
        <AlertCircle className="w-4 h-4 text-gray-400 mr-2" />
        <span className="text-sm text-gray-500">Pending</span>
      </div>
    );
  }
  
  // Calculate results for parameters
  const parameterResults = spec.parameters.map(param => {
    // Get linked tests for this parameter
    const paramLinkedTestIds = param.linkedTestIds || [];
    
    // If parameter has specific linked tests, use those, otherwise use all linked tests
    const relevantTestIds = paramLinkedTestIds.length > 0 
      ? paramLinkedTestIds 
      : spec.linkedTestIds;
    
    // Check if all relevant tests are completed
    const allTestsCompleted = relevantTestIds.every(testId => {
      const test = tests.find(t => t.id === testId);
      return test && test.status === 'Completed';
    });
    
    if (!allTestsCompleted) {
      return { status: 'Pending' };
    }
    
    // Mock result - in a real app, you would extract actual test values
    // For demo purposes, we'll randomly determine pass/fail with 80% pass rate
    return { status: Math.random() > 0.2 ? 'Pass' : 'Fail' };
  });
  
  const passingCount = parameterResults.filter(r => r.status === 'Pass').length;
  const failingCount = parameterResults.filter(r => r.status === 'Fail').length;
  const pendingCount = parameterResults.filter(r => r.status === 'Pending').length;
  
  // Determine overall status
  let overallStatus;
  let statusIcon;
  let statusColor;
  
  if (failingCount > 0) {
    overallStatus = 'Failing';
    statusIcon = <XCircle className="w-4 h-4 text-red-500 mr-2" />;
    statusColor = 'text-red-500';
  } else if (pendingCount > 0) {
    overallStatus = 'In Progress';
    statusIcon = <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />;
    statusColor = 'text-yellow-500';
  } else {
    overallStatus = 'Passing';
    statusIcon = <CheckCircle className="w-4 h-4 text-green-500 mr-2" />;
    statusColor = 'text-green-500';
  }
  
  return (
    <div className="flex items-center">
      {statusIcon}
      <span className={`text-sm font-medium ${statusColor}`}>
        {overallStatus}
      </span>
      <span className="text-xs text-gray-500 ml-2">
        ({passingCount}/{spec.parameters.length})
      </span>
    </div>
  );
}

export default function SpecificationList({ productId }: SpecificationListProps) {
  const navigate = useNavigate();
  const { products } = useProducts();
  const { specifications, deleteSpecification } = useSpecifications();
  const { tests } = useTests();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showChoiceModal, setShowChoiceModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [specToDelete, setSpecToDelete] = useState<string | null>(null);
  const [showGuidedWorkflow, setShowGuidedWorkflow] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    search: ''
  });

  const productSpecs = specifications.filter(spec => spec.productId === productId);
  const product = products.find(p => p.id === productId);
  
  // Check if this is a new product with no specifications
  const isNewProduct = productSpecs.length === 0;
  
  if (showGuidedWorkflow) {
    return (
      <GuidedWorkflow 
        productId={productId} 
        productName={product?.name || ''}
        onComplete={() => setShowGuidedWorkflow(false)}
      />
    );
  }
    
  const filteredSpecs = productSpecs.filter(spec => {
    const matchesStatus = filters.status.length === 0 || filters.status.includes(spec.status);
    const matchesSearch = !filters.search || 
      spec.name.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: SpecificationStatus) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Obsolete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Specifications</h1>
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
              placeholder="Search specifications..."
              className="pl-9 pr-4 py-2 w-[300px] text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => setShowChoiceModal(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Specification
          </button>
        </div>
      </div>

      {/* Specifications Table */}
      {filteredSpecs.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Spec ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Version
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Regions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parameters
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Results
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSpecs.map((spec) => (
                <tr
                  key={spec.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/products/${productId}/specifications/${spec.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {spec.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center">
                      <ClipboardList className="w-4 h-4 text-gray-400 mr-2" />
                      {spec.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    v{spec.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(spec.status)}`}>
                      {spec.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {spec.regions.join(', ')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {spec.parameters.length} parameters
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {renderSpecificationResults(spec, tests)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(spec.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSpecToDelete(spec.id);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-12 text-center">
          <ClipboardList className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Specifications Found</h3>
        </div>
      )}

      {/* Specification Creation Choice Modal */}
      {showChoiceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[500px]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Create Specification</h2>
              <button
                onClick={() => setShowChoiceModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Choose how you'd like to create your first specification for this product:
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => {
                    setShowChoiceModal(false);
                    setShowGuidedWorkflow(true);
                  }}
                  className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <ClipboardList className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Guided</h3>
                  <p className="text-sm text-gray-500 text-center">
                    Step-by-step workflow with recommendations based on regulatory requirements
                  </p>
                </button>
                
                <button
                  onClick={() => {
                    setShowChoiceModal(false);
                    setShowAddModal(true);
                  }}
                  className="flex flex-col items-center p-6 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50"
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <Plus className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Direct</h3>
                  <p className="text-sm text-gray-500 text-center">
                    Create a specification directly with custom parameters and criteria
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Specification Modal */}
      <NewSpecificationModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        productId={productId}
      />
      
      {/* Add Specification Modal (Simplified) */}
      <AddSpecificationModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        productId={productId}
      />

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-lg shadow-xl w-[400px]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filter Specifications</h2>
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
                {(['Draft', 'Active', 'Obsolete'] as SpecificationStatus[]).map(status => (
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
                    <span className="ml-2 text-sm text-gray-600">{status}</span>
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

      {/* Delete Confirmation Modal */}
      {showDeleteModal && specToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[400px]">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">Delete Specification</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete this specification? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSpecToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 mr-3"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (specToDelete) {
                    deleteSpecification(specToDelete);
                    setShowDeleteModal(false);
                    setSpecToDelete(null);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}