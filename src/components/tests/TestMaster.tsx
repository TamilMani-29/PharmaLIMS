import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Plus, Search, Filter, Download, X, Trash2, Eye, FileText, Edit2 } from 'lucide-react';
import { useTests, TestType, Test } from '../../context/TestContext';
import NewTestModal from './modals/NewTestModal';
import { Check } from 'lucide-react';

interface TestMasterProps {
  onTestClick: (testId: string) => void;
}

interface FilterState {
  type: TestType[];
  createdDate: string;
  sopId: string[];
}

const TEST_TYPES: TestType[] = [
  'Chemical Analysis',
  'Physical Testing',
  'Stability Study',
  'Microbial Testing',
  'Method Validation'
];

const MOCK_SOPS = [
  { id: 'SOP-001', name: 'pH Analysis Protocol' },
  { id: 'SOP-002', name: 'Stability Testing Protocol' },
  { id: 'SOP-003', name: 'Microbial Testing Protocol' },
];

export default function TestMaster({ onTestClick }: TestMasterProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { tests, deleteTest } = useTests();
  const [isNewTestModalOpen, setIsNewTestModalOpen] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    createdDate: '',
    sopId: [],
  });
  
  const productId = location.pathname.split('/')[2];
  
  const filteredTests = tests.filter(test => {
    const typeMatch = filters.type.length === 0 || filters.type.includes(test.type);
    const sopMatch = filters.sopId.length === 0 || (test.sopId && filters.sopId.includes(test.sopId));
    const dateMatch = !filters.createdDate || new Date(test.createdDate) <= new Date(filters.createdDate);
    const searchMatch = searchQuery === '' || 
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return typeMatch && sopMatch && dateMatch && searchMatch;
  });

  const toggleFilter = (category: keyof FilterState, value: any) => {
    if (category === 'createdDate') {
      setFilters(prev => ({
        ...prev,
        [category]: value
      }));
      return;
    }

    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: [],
      createdDate: '',
      sopId: [],
    });
  };

  const handleTestClick = (testId: string) => {
    onTestClick(testId);
  };

  const handleDeleteTest = () => {
    if (testToDelete) {
      deleteTest(testToDelete);
      setShowDeleteModal(false);
      setTestToDelete(null);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Test ID',
      'Test Name',
      'Type',
      'Created Date',
      'SOP Reference',
      'Description'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredTests.map(test => [
        test.id,
        test.name,
        test.type,
        test.createdDate,
        test.sopId || '',
        test.description.replace(/,/g, ';') // Replace commas to avoid CSV issues
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `tests_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Test Master</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {Object.values(filters).some(f => Array.isArray(f) ? f.length > 0 : f !== '') && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                {Object.values(filters).reduce((acc, curr) => 
                  acc + (Array.isArray(curr) ? curr.length : curr ? 1 : 0), 0
                )}
              </span>
            )}
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tests..."
              className="pl-9 pr-4 py-2 w-[400px] text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <button
            onClick={() => setIsNewTestModalOpen(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Test
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Tests Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
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
                Created Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                SOP Reference
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test Instructions
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTests.map((test) => (
              <tr
                key={test.id}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {test.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {test.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(test.createdDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {test.sopId || 'Not specified'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="truncate max-w-xs">{test.description ? test.description.substring(0, 60) + (test.description.length > 60 ? '...' : '') : 'No instructions'}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleTestClick(test.id)}
                      className="text-blue-600 hover:text-blue-900"
                      title="View Test"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        setTestToDelete(test.id);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Test"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredTests.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <p className="text-gray-500 text-lg">No tests found</p>
                  <button
                    onClick={() => setIsNewTestModalOpen(true)}
                    className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Create New Test
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Test Modal */}
      <NewTestModal
        isOpen={isNewTestModalOpen}
        onClose={() => setIsNewTestModalOpen(false)}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[400px]">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">Delete Test</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete this test? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setTestToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 mr-3"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteTest}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-lg shadow-xl w-[600px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filter Tests</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto">
              <div className="space-y-6">
                {/* Test Type Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Test Type</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {TEST_TYPES.map(type => (
                      <label
                        key={type}
                        className={`flex items-center p-3 rounded-lg border transition-colors ${
                          filters.type.includes(type)
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.type.includes(type)}
                          onChange={() => toggleFilter('type', type)}
                          className="sr-only"
                        />
                        <span className={`text-sm ${
                          filters.type.includes(type) ? 'text-blue-900' : 'text-gray-600'
                        }`}>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* SOP Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">SOP Reference</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {MOCK_SOPS.map(sop => (
                      <label
                        key={sop.id}
                        className={`flex items-center p-3 rounded-lg border transition-colors ${
                          filters.sopId.includes(sop.id)
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.sopId.includes(sop.id)}
                          onChange={() => toggleFilter('sopId', sop.id)}
                          className="sr-only"
                        />
                        <span className={`text-sm ${
                          filters.sopId.includes(sop.id) ? 'text-blue-900' : 'text-gray-600'
                        }`}>{sop.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Created Date Filter */}
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Created Date</h3>
                  <input
                    type="date"
                    value={filters.createdDate}
                    onChange={(e) => toggleFilter('createdDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Show tests created before this date
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200 mt-auto">
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