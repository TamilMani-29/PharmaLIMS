import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Filter, X, AlertCircle, CheckCircle2, Clock, Eye, ClipboardList, Play, PlayCircle } from 'lucide-react';
import { useSpecifications, SpecificationType } from '../../context/SpecificationContext';
import { useTests, StepStatus } from '../../context/TestContext';
import NewTestModal from './modals/NewTestModal';

interface FilterState {
  type: SpecificationType[];
  status: ('Pass' | 'Fail' | 'Pending')[];
  search: string;
}

export default function ParameterTestsView({ onTestClick }: { onTestClick: (testId: string) => void }) {
  const { specifications } = useSpecifications();
  const { tests, updateStepStatus, updateTest } = useTests();
  const navigate = useNavigate();
  const location = useLocation();
  const [showFilters, setShowFilters] = useState(false);
  const [showNewTestModal, setShowNewTestModal] = useState(false);
  const [selectedSpecId, setSelectedSpecId] = useState<string>('');
  const [selectedParamId, setSelectedParamId] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    status: [],
    search: ''
  });

  // Get all parameters from all specifications
  const allParameters = specifications.flatMap(spec => 
    spec.parameters.map(param => ({
      ...param,
      specId: spec.id,
      specName: spec.name
    }))
  );

  // Filter parameters based on search and type filters
  const filteredParameters = allParameters.filter(param => {
    const matchesType = filters.type.length === 0 || filters.type.includes(param.type);
    const matchesSearch = !filters.search || 
      param.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      param.specName.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  // Get tests linked to a parameter
  const getLinkedTests = (specId: string, paramId: string) => {
    const spec = specifications.find(s => s.id === specId);
    if (!spec) return [];
    
    const param = spec.parameters.find(p => p.id === paramId);
    if (!param || !param.linkedTestIds || param.linkedTestIds.length === 0) return [];
    
    return tests.filter(test => param.linkedTestIds?.includes(test.id));
  };

  // Calculate parameter compliance status
  const getParameterStatus = (specId: string, paramId: string) => {
    const linkedTests = getLinkedTests(specId, paramId);
    
    if (linkedTests.length === 0) return 'Pending';
    
    const completedTests = linkedTests.filter(test => test.status === 'Completed');
    if (completedTests.length === 0) return 'Pending';
    
    // Check if any test has failed results for this parameter
    const failedResults = completedTests.some(test => 
      test.samples.some(sample => 
        sample.parameterId === paramId && sample.resultStatus === 'Fail'
      )
    );
    
    return failedResults ? 'Fail' : 'Pass';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pass':
        return 'bg-green-100 text-green-800';
      case 'Fail':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pass':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'Fail':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTestStatusColor = (status: TestStatus) => {
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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Parameter Tests</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {filters.type.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                {filters.type.length}
              </span>
            )}
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              placeholder="Search parameters..."
              className="pl-9 pr-4 py-2 w-[300px] text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Parameters Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Parameter
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Specification
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Value
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Linked Tests
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredParameters.map((param) => {
              const paramStatus = getParameterStatus(param.specId, param.id);
              const linkedTests = getLinkedTests(param.specId, param.id);
              
              return (
                <tr 
                  key={`${param.specId}-${param.id}`}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => {
                    if (linkedTests.length > 0) {
                      onTestClick(linkedTests[0].id);
                    }
                  }}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {param.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <ClipboardList className="w-4 h-4 text-gray-400 mr-2" />
                      <div className="text-sm font-medium text-gray-900">{param.name}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {param.specName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {param.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {param.expectedValue} {param.unit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {linkedTests.length > 0 ? (
                      <div className="flex flex-col space-y-1">
                        {linkedTests.map(test => (
                          <div key={test.id} className="flex items-center">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getTestStatusColor(test.status)}`}>
                              {test.status}
                            </span>
                            <span className="ml-2 text-sm text-gray-900">{test.name}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No linked tests</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(paramStatus)}`}>
                      {getStatusIcon(paramStatus)}
                      <span className="ml-1">{paramStatus}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {linkedTests.length > 0 && (
                      <button
                        onClick={(e) => e.stopPropagation()}
                        className="flex space-x-2"
                      >
                        <button
                          onClick={() => onTestClick(linkedTests[0].id)}
                          className="text-blue-600 hover:text-blue-700"
                          title="View Test"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        
                        {linkedTests[0].status !== 'Completed' && (
                          <div className="relative group">
                            <button
                              onClick={() => {
                                const test = linkedTests[0];
                                // Find the first step that's not started or in progress
                                const sampleWithStep = test.samples.find(sample => 
                                  sample.steps.some(step => step.status !== 'Complete')
                                );
                                
                                if (sampleWithStep) {
                                  const stepToUpdate = sampleWithStep.steps.find(step => 
                                    step.status !== 'Complete'
                                  );
                                  
                                  if (stepToUpdate) {
                                    const newStatus: StepStatus = stepToUpdate.status === 'Not Started' 
                                      ? 'In Progress' 
                                      : 'Complete';
                                      
                                    updateStepStatus(
                                      test.id, 
                                      sampleWithStep.sampleId, 
                                      stepToUpdate.id, 
                                      newStatus
                                    );
                                    
                                    // Update test status if needed
                                    if (test.status === 'Not Started' && newStatus === 'In Progress') {
                                      updateTest(test.id, { status: 'In Progress' });
                                    }
                                  }
                                }
                              }}
                              className="text-green-600 hover:text-green-700 p-1 rounded-full hover:bg-green-50"
                              title="Start/Continue Test"
                            >
                              <PlayCircle className="w-4 h-4" />
                            </button>
                            <div className="absolute hidden group-hover:block right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                              <div className="px-4 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
                                Test Actions
                              </div>
                              <button
                                onClick={() => {
                                  const test = linkedTests[0];
                                  onTestClick(test.id);
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Eye className="w-4 h-4 inline mr-2" />
                                View Test Details
                              </button>
                              <button
                                onClick={() => {
                                  const test = linkedTests[0];
                                  // Find the first step that's not started
                                  const sampleWithStep = test.samples.find(sample => 
                                    sample.steps.some(step => step.status === 'Not Started')
                                  );
                                  
                                  if (sampleWithStep) {
                                    const stepToUpdate = sampleWithStep.steps.find(step => 
                                      step.status === 'Not Started'
                                    );
                                    
                                    if (stepToUpdate) {
                                      updateStepStatus(
                                        test.id, 
                                        sampleWithStep.sampleId, 
                                        stepToUpdate.id, 
                                        'In Progress'
                                      );
                                      
                                      // Update test status if needed
                                      if (test.status === 'Not Started') {
                                        updateTest(test.id, { status: 'In Progress' });
                                      }
                                    }
                                  }
                                }}
                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              >
                                <Play className="w-4 h-4 inline mr-2" />
                                Start Next Step
                              </button>
                            </div>
                          </div>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {filteredParameters.length === 0 && (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Parameters Found</h3>
                  <p className="text-gray-500">
                    {filters.search || filters.type.length > 0 
                      ? 'Try adjusting your filters to see more results'
                      : 'Create specifications with parameters to get started'}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* New Test Modal */}
      <NewTestModal
        isOpen={showNewTestModal}
        onClose={() => {
          setShowNewTestModal(false);
          setSelectedSpecId('');
          setSelectedParamId('');
        }}
        specificationId={selectedSpecId}
        parameterId={selectedParamId}
      />

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-lg shadow-xl w-[500px]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filter Parameters</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Parameter Type Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Parameter Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Physical', 'Chemical', 'Microbial', 'Performance', 'Stability', 'Other'].map(type => (
                    <label
                      key={type}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        filters.type.includes(type as SpecificationType)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.type.includes(type as SpecificationType)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...filters.type, type as SpecificationType]
                            : filters.type.filter(t => t !== type);
                          setFilters(prev => ({ ...prev, type: newTypes }));
                        }}
                        className="sr-only"
                      />
                      <span className={`text-sm ${
                        filters.type.includes(type as SpecificationType) ? 'text-blue-900' : 'text-gray-600'
                      }`}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Result Status</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['Pass', 'Fail', 'Pending'].map(status => (
                    <label
                      key={status}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        filters.status.includes(status as 'Pass' | 'Fail' | 'Pending')
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status as 'Pass' | 'Fail' | 'Pending')}
                        onChange={(e) => {
                          const newStatus = e.target.checked
                            ? [...filters.status, status as 'Pass' | 'Fail' | 'Pending']
                            : filters.status.filter(s => s !== status);
                          setFilters(prev => ({ ...prev, status: newStatus }));
                        }}
                        className="sr-only"
                      />
                      <span className={`text-sm ${
                        filters.status.includes(status as 'Pass' | 'Fail' | 'Pending') ? 'text-blue-900' : 'text-gray-600'
                      }`}>{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setFilters({
                    type: [],
                    status: [],
                    search: ''
                  });
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