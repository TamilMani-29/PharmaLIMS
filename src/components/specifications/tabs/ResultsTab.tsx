import React, { useState } from 'react';
import { Search, Filter, X, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { useSpecifications, SpecificationType } from '../../../context/SpecificationContext';
import { useTests } from '../../../context/TestContext';
import { StepStatus } from '../../../context/TestContext';

interface ResultsTabProps {
  specificationId: string;
}

interface FilterState {
  type: SpecificationType[];
  status: ('Pass' | 'Fail' | 'Pending')[];
  search: string;
}

export default function ResultsTab({ specificationId }: ResultsTabProps) {
  const { specifications } = useSpecifications();
  const { tests } = useTests();
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    status: [],
    search: ''
  });

  const specification = specifications.find(s => s.id === specificationId);
  if (!specification) return null;

  const linkedTests = tests.filter(test => specification.linkedTestIds.includes(test.id));
  const completedTests = linkedTests.filter(test => test.status === 'Completed');

  // Get test results for each parameter
  const parameterResults = specification.parameters.map(param => {
    // Get linked tests for this parameter
    const paramLinkedTestIds = param.linkedTestIds || [];
    
    // If parameter has specific linked tests, use those, otherwise use all linked tests
    const relevantTestIds = paramLinkedTestIds.length > 0 
      ? paramLinkedTestIds 
      : specification.linkedTestIds;
    
    // Get results from completed tests
    const testResults = relevantTestIds.flatMap(testId => {
      const test = tests.find(t => t.id === testId);
      if (!test) return [];

      // Get results from completed samples
      return test.samples
        .filter(sample => sample.status === 'Completed' && sample.results)
        .map(sample => ({
          testId: test.id,
          testName: test.name,
          sampleId: sample.sampleId,
          value: sample.results || '',
          date: sample.completedDate || new Date().toISOString(),
          status: sample.resultStatus || 'Pending'
        }));
    });

    return {
      ...param,
      results: testResults,
      status: testResults.length > 0 
        ? testResults.every(r => r.status === 'Pass') 
          ? 'Pass' 
          : 'Fail'
      : 'Pending'
    };
  });

  const filteredResults = parameterResults.filter(param => {
    const matchesType = filters.type.length === 0 || filters.type.includes(param.type);
    const matchesStatus = filters.status.length === 0 || filters.status.includes(param.status);
    const matchesSearch = !filters.search || 
      param.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      param.testMethod?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pass':
        return 'bg-green-100 text-green-800';
      case 'Fail':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pass':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'Fail':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
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
            {(filters.type.length > 0 || filters.status.length > 0) && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                {filters.type.length + filters.status.length}
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

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-500">Total Parameters</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900">
            {parameterResults.length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-500">Passing</p>
          <p className="mt-2 text-3xl font-semibold text-green-600">
            {parameterResults.filter(p => p.status === 'Pass').length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm font-medium text-gray-500">Failing</p>
          <p className="mt-2 text-3xl font-semibold text-red-600">
            {parameterResults.filter(p => p.status === 'Fail').length}
          </p>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
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
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Value
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Latest Result
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Linked Tests
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test Method
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredResults.map((param) => (
              <tr key={param.id} className="group hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                  {param.id}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900">{param.name}</span>
                    {param.mandatory && (
                      <span className="text-xs text-gray-500">Required</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {param.type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {param.expectedValue}
                    {param.acceptableRange && (
                      <span className="text-xs text-gray-500 ml-2">
                        ({param.acceptableRange.min} - {param.acceptableRange.max})
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {param.results.length > 0 ? (
                    <div className="text-sm text-gray-900">
                      {param.results[0].value} {param.unit}
                      <span className="text-xs text-gray-500 ml-2">
                        ({new Date(param.results[0].date).toLocaleDateString()})
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-500">No results</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(param.status)}`}>
                    {getStatusIcon(param.status)}
                    <span className="ml-1">{param.status}</span>
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {param.linkedTestIds?.length ? (
                    <div className="flex flex-col space-y-1">
                      {param.linkedTestIds.map(testId => {
                        const test = tests.find(t => t.id === testId);
                        return test ? (
                          <div key={testId} className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${
                              test.status === 'Completed' ? 'bg-green-500' :
                              test.status === 'In Progress' ? 'bg-blue-500' : 'bg-gray-500'
                            }`}></span>
                            <span>{test.name}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <span>-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {param.testMethod || '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-lg shadow-xl w-[500px]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filter Results</h2>
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
                  {['Physical', 'Chemical', 'Microbial', 'Performance', 'Stability'].map(type => (
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