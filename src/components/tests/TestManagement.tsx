import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Plus, List, Columns, Search, Filter, Download, X, Check, Trash2, Edit2, Eye, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useTests, TestType, TestStatus } from '../../context/TestContext';
import TestTable from './views/TestTable';
import TestKanban from './views/TestKanban';
import { useSpecifications } from '../../context/SpecificationContext';
import NewTestModal from './modals/NewTestModal';
import { Listbox, Transition } from '@headlessui/react';

type ViewMode = 'table' | 'kanban';

interface FilterState {
  type: TestType[];
  status: TestStatus[];
  parameterId: string[];
  assignedTo: string[];
  dueDate: string[];
  createdDate: string;
}

const TEST_TYPES: TestType[] = [
  'Chemical Analysis',
  'Physical Testing',
  'Stability Study',
  'Microbial Testing',
  'Method Validation'
];

const TEST_STATUSES: TestStatus[] = [
  'Not Started',
  'In Progress',
  'Completed'
];

const OPERATORS = [
  'Dr. Sarah Chen',
  'Dr. Mike Johnson',
  'Dr. Emily Taylor',
  'Dr. James Wilson'
];

const DUE_DATE_OPTIONS = [
  { id: 'overdue', name: 'Overdue' },
  { id: 'today', name: 'Due Today' },
  { id: 'tomorrow', name: 'Due Tomorrow' },
  { id: 'this_week', name: 'Due This Week' },
  { id: 'next_week', name: 'Due Next Week' },
  { id: 'later', name: 'Due Later' },
  { id: 'no_date', name: 'No Due Date' }
];

export default function TestManagement({ onTestClick }: TestManagementProps) {
  const [isNewTestModalOpen, setIsNewTestModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [testToDelete, setTestToDelete] = useState<string | null>(null);
  const { specifications, linkTestToParameter } = useSpecifications();
  const location = useLocation();
  const [fromParameterTab, setFromParameterTab] = useState(false);
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    status: [],
    parameterId: [],
    assignedTo: [],
    dueDate: [],
    createdDate: '',
  });
  
  const { tests, deleteTest } = useTests();
  const productId = location.pathname.split('/')[2];
  
  const filteredTests = tests.filter(test => {
    const typeMatch = filters.type.length === 0 || filters.type.includes(test.type);
    const statusMatch = filters.status.length === 0 || filters.status.includes(test.status);
    const parameterMatch = filters.parameterId.length === 0 || 
      (test.parameterId && filters.parameterId.includes(test.parameterId));
    const assignedToMatch = filters.assignedTo.length === 0 || 
      (filters.assignedTo.includes('unassigned') ? !test.assignedTo : 
       filters.assignedTo.includes(test.assignedTo || ''));
    const dateMatch = !filters.createdDate || new Date(test.createdDate) <= new Date(filters.createdDate);
    const searchMatch = searchQuery === '' || 
      test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      test.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Due date filtering
    let dueDateMatch = true;
    if (filters.dueDate.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const nextWeekStart = new Date(today);
      nextWeekStart.setDate(today.getDate() + 7);
      
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const nextWeekEnd = new Date(nextWeekStart);
      nextWeekEnd.setDate(nextWeekStart.getDate() + 6);
      
      // Check if test matches any of the selected due date filters
      dueDateMatch = filters.dueDate.length === 0 || filters.dueDate.some(dateFilter => {
        switch (dateFilter) {
          case 'overdue':
            return !!test.dueDate && new Date(test.dueDate) < today && test.status !== 'Completed';
          case 'today':
            return !!test.dueDate && new Date(test.dueDate).toDateString() === today.toDateString();
          case 'tomorrow':
            return !!test.dueDate && new Date(test.dueDate).toDateString() === tomorrow.toDateString();
          case 'this_week':
            return !!test.dueDate && 
              new Date(test.dueDate) >= weekStart && 
              new Date(test.dueDate) <= weekEnd;
          case 'next_week':
            return !!test.dueDate && 
              new Date(test.dueDate) >= nextWeekStart && 
              new Date(test.dueDate) <= nextWeekEnd;
          case 'later':
            return !!test.dueDate && new Date(test.dueDate) > nextWeekEnd;
          case 'no_date':
            return !test.dueDate;
          default:
            return false;
        }
      });
    }
    
    return typeMatch && statusMatch && parameterMatch && assignedToMatch && dateMatch && dueDateMatch && searchMatch;
  });

  // Check if we should open the new test modal (coming from specification parameter)
  React.useEffect(() => {
    if (location?.state?.openNewTestModal) {
      setFromParameterTab(location?.state?.fromParameterTab || false);
      setIsNewTestModalOpen(true);
    }
  }, [location?.state]);

  // Handler for when a test is created
  const handleTestCreated = (testId: string) => {
    // If we came from a specification parameter, link the test to the parameter
    if (fromParameterTab && location?.state?.specificationId && location?.state?.parameterId) {
      linkTestToParameter(
        location.state.specificationId,
        location.state.parameterId,
        testId
      );
    }
  };

  const handleDeleteTest = () => {
    if (testToDelete) {
      deleteTest(testToDelete);
      setShowDeleteModal(false);
      setTestToDelete(null);
    }
  };

  const toggleFilter = (category: keyof FilterState, value: any) => {
    if (category === 'createdDate' || category === 'dueDate') {
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
      parameterId: [],
      status: [],
      assignedTo: [],
      dueDate: [],
      createdDate: '',
    });
  };

  const exportToCSV = () => {
    const headers = [
      'Test ID',
      'Test Name',
      'Type',
      'Created Date',
      'Assigned To',
      'Status',
      'Samples Count'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredTests.map(test => [
        test.id,
        test.name,
        test.type,
        test.createdDate,
        test.assignedTo || 'Not assigned',
        test.status,
        test.samples.length
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
    <div className="h-full p-6">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Test Management</h1>
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded ${
                viewMode === 'table'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1.5 rounded ${
                viewMode === 'kanban'
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Columns className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
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
        </div>
        <div className="flex items-center space-x-3">
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

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[calc(100vh-12rem)]">
        {viewMode === 'table' ? (
          <TestTable tests={filteredTests} onTestClick={(testId) => {
            // If we're coming from a sample, we need to navigate back to the sample after viewing the test
            if (location.state?.fromSample) {
              navigate(`/products/${productId}/tests/${testId}`, {
                state: { 
                  fromSample: true,
                  sampleId: location.state.sampleId
                }
              });
            } else {
              onTestClick(testId);
            }
          }} />
        ) : (
          <TestKanban tests={filteredTests} onTestClick={(testId) => {
            // If we're coming from a sample, we need to navigate back to the sample after viewing the test
            if (location.state?.fromSample) {
              navigate(`/products/${productId}/tests/${testId}`, {
                state: { 
                  fromSample: true,
                  sampleId: location.state.sampleId
                }
              });
            } else {
              onTestClick(testId);
            }
          }} />
        )}
      </div>

      {/* New Test Modal */}
      <NewTestModal
        isOpen={isNewTestModalOpen}
        onClose={() => {
          setIsNewTestModalOpen(false);
          setFromParameterTab(false);
          // If we came from a specification, navigate back
          if (location?.state?.specificationId && location?.state?.returnToSpecification) {
            navigate(`/products/${productId}/specifications/${location.state.specificationId}`, {
              state: { activeTab: 'parameters' }
            });
          }
        }}
        specificationId={location?.state?.specificationId}
        parameterId={location?.state?.parameterId}
        onTestCreated={handleTestCreated}
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
                <div>
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

                {/* Status Filter */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Status</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {TEST_STATUSES.map(status => (
                      <label
                        key={status}
                        className={`flex items-center p-3 rounded-lg border transition-colors ${
                          filters.status.includes(status)
                            ? 'bg-blue-50 border-blue-200'
                            : 'bg-white border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
                          onChange={() => toggleFilter('status', status)}
                          className="sr-only"
                        />
                        <span className={`text-sm ${
                          filters.status.includes(status) ? 'text-blue-900' : 'text-gray-600'
                        }`}>{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Parameter Filter */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Parameter</h3>
                  <div className="relative">
                    <Listbox
                      value={filters.parameterId}
                      onChange={(selected) => setFilters(prev => ({ ...prev, parameterId: selected }))}
                      multiple
                    >
                      <div className="relative">
                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm">
                          <span className="block truncate">
                            {filters.parameterId.length === 0 
                              ? 'All parameters' 
                              : `${filters.parameterId.length} selected`}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                              <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={React.Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            <div className="px-3 py-2 border-b border-gray-100">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setFilters(prev => ({ ...prev, parameterId: [] }));
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Clear selection
                              </button>
                            </div>
                            {specifications.flatMap(spec => 
                              spec.parameters.map(param => ({
                                id: param.id,
                                name: param.name,
                                specName: spec.name
                              }))
                            ).map((param) => (
                              <Listbox.Option
                                key={param.id}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                                  }`
                                }
                                value={param.id}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? 'font-medium' : 'font-normal'
                                      }`}
                                    >
                                      {param.name}
                                      <span className="text-xs text-gray-500 ml-1">
                                        ({param.specName})
                                      </span>
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                        <Check className="h-4 w-4" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                    {filters.parameterId.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {filters.parameterId.map(paramId => {
                          const parameter = specifications.flatMap(s => s.parameters).find(p => p.id === paramId);
                          return (
                            <span 
                              key={paramId}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                            >
                              {parameter?.name || paramId}
                              <button
                                onClick={() => toggleFilter('parameterId', paramId)}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assigned To Filter */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Assigned To</h3>
                  <div className="relative">
                    <Listbox
                      value={filters.assignedTo}
                      onChange={(selected) => setFilters(prev => ({ ...prev, assignedTo: selected }))}
                      multiple
                    >
                      <div className="relative">
                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm">
                          <span className="block truncate">
                            {filters.assignedTo.length === 0 
                              ? 'All assignees' 
                              : `${filters.assignedTo.length} selected`}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                              <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={React.Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            <div className="px-3 py-2 border-b border-gray-100">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setFilters(prev => ({ ...prev, assignedTo: [] }));
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Clear selection
                              </button>
                            </div>
                            {OPERATORS.map((operator) => (
                              <Listbox.Option
                                key={operator}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                                  }`
                                }
                                value={operator}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? 'font-medium' : 'font-normal'
                                      }`}
                                    >
                                      {operator}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                        <Check className="h-4 w-4" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                            <Listbox.Option
                              className={({ active }) =>
                                `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                  active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                                }`
                              }
                              value="unassigned"
                            >
                              {({ selected, active }) => (
                                <>
                                  <span
                                    className={`block truncate ${
                                      selected ? 'font-medium' : 'font-normal'
                                    }`}
                                  >
                                    Unassigned
                                  </span>
                                  {selected ? (
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                      <Check className="h-4 w-4" aria-hidden="true" />
                                    </span>
                                  ) : null}
                                </>
                              )}
                            </Listbox.Option>
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                    {filters.assignedTo.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {filters.assignedTo.map(assignee => (
                          <span 
                            key={assignee}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                          >
                            {assignee}
                            <button
                              onClick={() => toggleFilter('assignedTo', assignee)}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Due Date Filter */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Due Date</h3>
                  <div className="relative">
                    <Listbox 
                      value={filters.dueDate}
                      onChange={(selected) => setFilters(prev => ({ ...prev, dueDate: selected }))}
                      multiple
                    >
                      <div className="relative">
                
                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm">
                          <span className="block truncate">
                            {filters.dueDate.length === 0 
                              ? 'Select due date filter' 
                              : `${filters.dueDate.length} selected`}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                              <path d="M7 7l3 3 3-3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={React.Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            <div className="px-3 py-2 border-b border-gray-100">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  setFilters(prev => ({ ...prev, dueDate: [] }));
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Clear selection
                              </button>
                            </div>
                            {DUE_DATE_OPTIONS.map((option) => (
                              <Listbox.Option
                                key={option.id}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-blue-50 text-blue-900' : 'text-gray-900'
                                  }`
                                }
                                value={option.id}
                              >
                                {({ selected, active }) => (
                                  <>
                                    <span
                                      className={`block truncate ${
                                        selected ? 'font-medium' : 'font-normal'
                                      }`}
                                    >
                                      {option.name}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                        <Check className="h-4 w-4" aria-hidden="true" />
                                      </span>
                                    ) : null}
                                  
                                  </>
                                )}
                              </Listbox.Option>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                    {filters.dueDate.length > 0 && (
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-2">
                          {filters.dueDate.map(dateId => (
                            <span key={dateId} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
                              {DUE_DATE_OPTIONS.find(opt => opt.id === dateId)?.name}
                              <button
                                onClick={() => setFilters(prev => ({
                                  ...prev,
                                  dueDate: prev.dueDate.filter(id => id !== dateId)
                                }))}
                                className="ml-1 text-blue-600 hover:text-blue-800"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Created Date Filter */}
                <div>
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