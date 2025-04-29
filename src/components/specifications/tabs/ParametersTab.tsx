import React, { useState } from 'react';
import { Plus, Search, Filter, X, Edit2, Check, AlertCircle, Link2, Eye, Unlink } from 'lucide-react';
import { useSpecifications, SpecificationType, SpecificationParameter } from '../../../context/SpecificationContext';
import { useTests } from '../../../context/TestContext';
import { useNavigate, useLocation } from 'react-router-dom';

// Add a callback for when a test is created
interface ParametersTabProps {
  specificationId: string;
}

interface FilterState {
  type: SpecificationType[];
  mandatory: boolean | null;
  hasMethod: boolean | null;
  search: string;
}

const PARAMETER_TYPES: SpecificationType[] = [
  'Physical',
  'Chemical',
  'Microbial',
  'Performance',
  'Stability',
  'Other'
];

export default function ParametersTab({ specificationId }: ParametersTabProps) {
  const { specifications, updateParameter, addParameter, deleteParameter, linkTestToParameter, unlinkTestFromParameter } = useSpecifications();
  const { tests } = useTests();
  const navigate = useNavigate();
  const location = useLocation(); 
  const [showFilters, setShowFilters] = useState(false);
  const [showLinkTestModal, setShowLinkTestModal] = useState(false);
  const [selectedParameterId, setSelectedParameterId] = useState<string | null>(null);
  const productId = location.pathname.split('/')[2];
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    mandatory: null,
    hasMethod: null,
    search: ''
  });
  const [editingParameter, setEditingParameter] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<SpecificationParameter>>({});

  const handleAddParameter = () => {
    const newParameter: Omit<SpecificationParameter, 'id'> = {
      name: 'New Parameter',
      type: 'Physical',
      unit: '',
      expectedValue: '',
      mandatory: false
    };
    const parameterId = addParameter(specificationId, newParameter);
    
    // Set the form data and enable edit mode for the new parameter
    setEditForm({
      name: newParameter.name,
      type: newParameter.type,
      unit: newParameter.unit,
      expectedValue: newParameter.expectedValue,
      mandatory: newParameter.mandatory
    });
    setEditingParameter(parameterId);
  };

  const specification = specifications.find(s => s.id === specificationId);
  if (!specification) return null;

  const filteredParameters = specification.parameters.filter(param => {
    const matchesType = filters.type.length === 0 || filters.type.includes(param.type);
    const matchesMandatory = filters.mandatory === null || param.mandatory === filters.mandatory;
    const matchesMethod = filters.hasMethod === null || 
      (filters.hasMethod ? !!param.testMethod : !param.testMethod);
    const matchesSearch = !filters.search || 
      param.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      param.testMethod?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesType && matchesMandatory && matchesMethod && matchesSearch;
  });

  const handleSaveParameter = (parameterId: string) => {
    if (Object.keys(editForm).length > 0) {
      updateParameter(specificationId, parameterId, editForm);
    }
    setEditingParameter(null);
    setEditForm({});
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
            {(filters.type.length > 0 || filters.mandatory !== null || filters.hasMethod !== null) && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                {filters.type.length + (filters.mandatory !== null ? 1 : 0) + (filters.hasMethod !== null ? 1 : 0)}
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
        <button
          onClick={() => handleAddParameter()}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Parameter
        </button>
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
                Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Unit
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Value
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Test Method
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                Test to Perform
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mandatory
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredParameters.map((param) => (
              <tr key={param.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-xs text-gray-500">{param.id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingParameter === param.id ? (
                    <input
                      type="text"
                      value={editForm.name || param.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-sm font-medium text-gray-900">{param.name}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingParameter === param.id ? (
                    <select
                      value={editForm.type || param.type}
                      onChange={(e) => setEditForm(prev => ({ ...prev, type: e.target.value as SpecificationType }))}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {PARAMETER_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  ) : (
                    <div className="text-sm text-gray-500">{param.type}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingParameter === param.id ? (
                    <input
                      type="text"
                      value={editForm.unit || param.unit}
                      onChange={(e) => setEditForm(prev => ({ ...prev, unit: e.target.value }))}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-500">{param.unit}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingParameter === param.id ? (
                    <input
                      type="text"
                      value={editForm.expectedValue || param.expectedValue}
                      onChange={(e) => setEditForm(prev => ({ ...prev, expectedValue: e.target.value }))}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-500">{param.expectedValue}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingParameter === param.id ? (
                    <input
                      type="text"
                      value={editForm.testMethod || param.testMethod || ''}
                      onChange={(e) => setEditForm(prev => ({ ...prev, testMethod: e.target.value }))}
                      className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-500">{param.testMethod || '-'}</div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <select
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={param.linkedTestIds?.[0] || ''}
                      onChange={(e) => {
                        const testId = e.target.value;
                        if (testId) {
                          // First remove any existing links
                          if (param.linkedTestIds?.length) {
                            param.linkedTestIds.forEach(id => {
                              unlinkTestFromParameter(specificationId, param.id, id);
                            });
                          }
                          
                          // Then add the new link
                          linkTestToParameter(specificationId, param.id, testId);
                          
                          // Make sure the test is linked to the specification
                          if (!specification.linkedTestIds.includes(testId)) {
                            linkTest(specificationId, testId);
                          }
                        } else if (param.linkedTestIds?.length) {
                          // Remove all test links
                          param.linkedTestIds.forEach(id => {
                            unlinkTestFromParameter(specificationId, param.id, id);
                          });
                        }
                      }}
                    >
                      <option value="">Select test...</option>
                      {tests.map(test => (
                        <option key={test.id} value={test.id}>
                          {test.name} ({test.id})
                        </option>
                      ))}
                    </select>
                    {param.linkedTestIds?.[0] && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const productId = location.pathname.split('/')[2];
                          const testId = param.linkedTestIds![0];
                          navigate(`/products/${productId}/tests/${testId}`, {
                            state: { 
                              from: 'specification',
                              specificationId: specificationId
                            }
                          });
                        }}
                        className="text-blue-600 hover:text-blue-700 flex-shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {editingParameter === param.id ? (
                    <input
                      type="checkbox"
                      checked={editForm.mandatory ?? param.mandatory}
                      onChange={(e) => setEditForm(prev => ({ ...prev, mandatory: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-500">
                      {param.mandatory ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Required
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Optional
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {editingParameter === param.id ? (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSaveParameter(param.id)}
                        className="text-green-600 hover:text-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingParameter(null);
                          setEditForm({});
                        }}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingParameter(param.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteParameter(specificationId, param.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Link Test to Parameter Modal */}
      {showLinkTestModal && selectedParameterId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-lg shadow-xl w-[600px]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Link Tests to Parameter</h2>
              <button
                onClick={() => {
                  setShowLinkTestModal(false);
                  setSelectedParameterId(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Parameter: {specification.parameters.find(p => p.id === selectedParameterId)?.name}
                </h3>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Link tests that verify this parameter's acceptance criteria.
                  </p>
                  <button
                    onClick={() => {
                      setShowLinkTestModal(false);
                      setSelectedParameterId(null);
                      navigate(`/products/${productId}/tests`, {
                        state: { 
                          openNewTestModal: true,
                          specificationId,
                          parameterId: selectedParameterId,
                          returnToSpecification: true,
                          fromParameterTab: true
                        }
                      });
                    }}
                    className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    Create New Test
                  </button>
                </div>
              </div>
              
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {tests.filter(test => specification.linkedTestIds.includes(test.id)).map(test => {
                  const parameter = specification.parameters.find(p => p.id === selectedParameterId);
                  const isLinked = parameter?.linkedTestIds?.includes(test.id);

                  return (
                    <div key={test.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{test.name}</p>
                        <p className="text-xs text-gray-500">{test.id} - {test.type}</p>
                      </div>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isLinked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              linkTestToParameter(specificationId, selectedParameterId, test.id);
                            } else {
                              unlinkTestFromParameter(specificationId, selectedParameterId, test.id);
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">
                          {isLinked ? 'Linked' : 'Link'}
                        </span>
                        {isLinked && (
                          <button
                            onClick={() => unlinkTestFromParameter(specificationId, selectedParameterId, test.id)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <Unlink className="w-4 h-4" />
                          </button>
                        )}
                      </label>
                    </div>
                  );
                })}
                
                {tests.filter(test => specification.linkedTestIds.includes(test.id)).length === 0 && (
                  <div className="text-center py-6">
                    <p className="text-sm text-gray-500">
                      No tests are linked to this specification yet.
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      Go to the "Linked Tests" tab to add tests first.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowLinkTestModal(false);
                  setSelectedParameterId(null);
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

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
                  {PARAMETER_TYPES.map(type => (
                    <label
                      key={type}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        filters.type.includes(type)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.type.includes(type)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...filters.type, type]
                            : filters.type.filter(t => t !== type);
                          setFilters(prev => ({ ...prev, type: newTypes }));
                        }}
                        className="sr-only"
                      />
                      <span className={`text-sm ${
                        filters.type.includes(type) ? 'text-blue-900' : 'text-gray-600'
                      }`}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Other Filters */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Other Filters</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.mandatory === true}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        mandatory: e.target.checked ? true : null
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Show only mandatory parameters</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.hasMethod === true}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        hasMethod: e.target.checked ? true : null
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-600">Show only parameters with test methods</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setFilters({
                    type: [],
                    mandatory: null,
                    hasMethod: null,
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