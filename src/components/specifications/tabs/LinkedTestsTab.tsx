import React, { useState } from 'react';
import { Plus, Search, Filter, X, Link2, Unlink, AlertCircle, CheckCircle2, Clock, Eye } from 'lucide-react';
import { useSpecifications } from '../../../context/SpecificationContext';
import { useTests, TestStatus } from '../../../context/TestContext';
import { useNavigate } from 'react-router-dom';
import LinkParameterToTestModal from '../modals/LinkParameterToTestModal';

interface LinkedTestsTabProps {
  specificationId: string;
}

interface FilterState {
  status: TestStatus[];
  search: string;
}

export default function LinkedTestsTab({ specificationId }: LinkedTestsTabProps) {
  const { specifications, linkTest, unlinkTest } = useSpecifications();
  const { tests } = useTests();
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showLinkParameterModal, setShowLinkParameterModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    search: ''
  });

  const specification = specifications.find(s => s.id === specificationId);
  if (!specification) return null;

  const linkedTests = tests.filter(test => specification.linkedTestIds.includes(test.id));
  const availableTests = tests.filter(test => !specification.linkedTestIds.includes(test.id));

  const filteredTests = linkedTests.filter(test => {
    const matchesStatus = filters.status.length === 0 || filters.status.includes(test.status);
    const matchesSearch = !filters.search || 
      test.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      test.id.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: TestStatus) => {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'Not Started':
        return <Clock className="w-4 h-4" />;
      case 'In Progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
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
              placeholder="Search tests..."
              className="pl-9 pr-4 py-2 w-[300px] text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        <button
          onClick={() => setShowLinkModal(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Link Test
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-500">Total Tests</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {linkedTests.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-500">Completed</p>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {linkedTests.filter(t => t.status === 'Completed').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-500">In Progress</p>
          <p className="mt-2 text-3xl font-semibold text-blue-600">
            {linkedTests.filter(t => t.status === 'In Progress').length}
          </p>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Samples
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTests.map((test) => (
              <tr key={test.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {test.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {test.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(test.status)}`}>
                    {getStatusIcon(test.status)}
                    <span className="ml-1">{test.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.samples.length} samples
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(test.createdDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to test details
                        const productId = specification.productId;
                        navigate(`/products/${productId}/tests/${test.id}`, {
                          state: { 
                            from: 'specification',
                            specificationId: specificationId
                          }
                        });
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTestId(test.id);
                        setShowLinkParameterModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <Link2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => unlinkTest(specificationId, test.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Unlink className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Link Test Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-lg shadow-xl w-[800px]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Link Test</h2>
              <button
                onClick={() => setShowLinkModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    type="text"
                    placeholder="Search available tests..."
                    className="pl-9 pr-4 py-2 w-full text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {availableTests.map(test => (
                  <div
                    key={test.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                  >
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{test.name}</h3>
                      <p className="text-sm text-gray-500">
                        {test.id} - {test.type}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        linkTest(specificationId, test.id);
                        setShowLinkModal(false);
                      }}
                      className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                    >
                      <Link2 className="w-4 h-4 mr-2" />
                      Link
                    </button>
                  </div>
                ))}
                {availableTests.length === 0 && (
                  <p className="text-center text-sm text-gray-500 py-4">
                    No available tests to link
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowLinkModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Link Parameter to Test Modal */}
      {showLinkParameterModal && selectedTestId && (
        <LinkParameterToTestModal
          isOpen={showLinkParameterModal}
          onClose={() => {
            setShowLinkParameterModal(false);
            setSelectedTestId(null);
          }}
          specificationId={specificationId}
          testId={selectedTestId}
        />
      )}

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-lg shadow-xl w-[400px]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filter Tests</h2>
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
                {(['Not Started', 'In Progress', 'Completed'] as TestStatus[]).map(status => (
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
    </div>
  );
}