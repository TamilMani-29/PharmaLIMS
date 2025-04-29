import React, { useState } from 'react';
import { X, Plus, Link2, Check } from 'lucide-react';
import { useSpecifications, SpecificationType, SpecificationStatus } from '../../../context/SpecificationContext';
import { useTests } from '../../../context/TestContext';

interface AddSpecificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

const PARAMETER_TYPES: SpecificationType[] = [
  'Physical',
  'Chemical',
  'Microbial',
  'Performance',
  'Stability',
  'Other'
];

export default function AddSpecificationModal({ isOpen, onClose, productId }: AddSpecificationModalProps) {
  const { addSpecification } = useSpecifications();
  const { tests } = useTests();
  const [formData, setFormData] = useState({
    name: '',
    version: '1.0',
    status: 'Draft' as SpecificationStatus,
    regions: [] as string[],
    regulatoryGuidelines: [] as string[],
    parameters: [] as Array<{
      name: string;
      type: SpecificationType;
      unit: string;
      expectedValue: string;
      testMethod?: string;
      mandatory: boolean;
      linkedTestIds?: string[];
    }>,
    linkedTestIds: [] as string[]
  });

  const [newParameter, setNewParameter] = useState({
    name: '',
    type: 'Physical' as SpecificationType,
    unit: '',
    expectedValue: '',
    testMethod: '',
    mandatory: false,
    linkedTestIds: [] as string[]
  });

  if (!isOpen) return null;

  const handleAddParameter = () => {
    if (!newParameter.name || !newParameter.expectedValue) return;
    
    setFormData(prev => ({
      ...prev,
      parameters: [...prev.parameters, { ...newParameter }]
    }));
    
    // Reset the form for the next parameter
    setNewParameter({
      name: '',
      type: 'Physical',
      unit: '',
      expectedValue: '',
      testMethod: '',
      mandatory: false,
      linkedTestIds: []
    });
  };

  const handleRemoveParameter = (index: number) => {
    setFormData(prev => ({
      ...prev,
      parameters: prev.parameters.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    addSpecification({
      ...formData,
      productId,
      createdBy: 'John Doe'
    });
    onClose();
  };

  const toggleTestForParameter = (paramIndex: number, testId: string) => {
    setFormData(prev => {
      const updatedParameters = [...prev.parameters];
      updatedParameters[paramIndex] = {
        ...updatedParameters[paramIndex],
        linkedTestIds: updatedParameters[paramIndex].linkedTestIds || [],
      };

      if (updatedParameters[paramIndex].linkedTestIds!.includes(testId)) {
        updatedParameters[paramIndex].linkedTestIds = updatedParameters[paramIndex].linkedTestIds!.filter(id => id !== testId);
      } else {
        updatedParameters[paramIndex].linkedTestIds = [...updatedParameters[paramIndex].linkedTestIds!, testId];
      }
      
      return {
        ...prev,
        parameters: updatedParameters
      };
    });
  };

  const toggleTest = (testId: string) => {
    setFormData(prev => {
      if (prev.linkedTestIds.includes(testId)) {
        return {
          ...prev,
          linkedTestIds: prev.linkedTestIds.filter(id => id !== testId)
        };
      } else {
        return {
          ...prev,
          linkedTestIds: [...prev.linkedTestIds, testId]
        };
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Specification</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specification Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Version
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as SpecificationStatus }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Active">Active</option>
                    <option value="Obsolete">Obsolete</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Regions
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {['US', 'EU', 'JP', 'ROW'].map(region => (
                      <label key={region} className="inline-flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.regions.includes(region)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                regions: [...prev.regions, region]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                regions: prev.regions.filter(r => r !== region)
                              }));
                            }
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{region}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Parameters */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Parameters</h3>
                <span className="text-sm text-gray-500">{formData.parameters.length} parameters added</span>
              </div>

              {/* Parameter List */}
              <div className="mb-6">
                {formData.parameters.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Value</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Method</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mandatory</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Link Test</th>
                          <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {formData.parameters.map((param, index) => (
                          <tr key={index}>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{param.name}</div>
                              <div className="text-xs text-gray-500">{param.id || `PARAM-${index+1}`}</div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{param.type}</div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{param.unit}</div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{param.expectedValue}</div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="text-sm text-gray-500">{param.testMethod || '-'}</div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center">
                              <div className="text-sm text-gray-500">
                                {param.mandatory ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Yes
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    No
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <select
                                value={param.linkedTestIds?.[0] || ''}
                                onChange={(e) => {
                                  const testId = e.target.value;
                                  
                                  if (testId) {
                                    // Update parameter's linkedTestIds
                                    const updatedParameters = [...formData.parameters];
                                    updatedParameters[index] = {
                                      ...updatedParameters[index],
                                      linkedTestIds: [testId]
                                    };
                                    
                                    // Also add to the specification's linkedTestIds if not already there
                                    const updatedLinkedTestIds = formData.linkedTestIds.includes(testId)
                                      ? formData.linkedTestIds
                                      : [...formData.linkedTestIds, testId];
                                    
                                    setFormData(prev => ({
                                      ...prev,
                                      parameters: updatedParameters,
                                      linkedTestIds: updatedLinkedTestIds
                                    }));
                                  } else {
                                    // Remove the test link
                                    const updatedParameters = [...formData.parameters];
                                    updatedParameters[index] = {
                                      ...updatedParameters[index],
                                      linkedTestIds: []
                                    };
                                    
                                    setFormData(prev => ({
                                      ...prev,
                                      parameters: updatedParameters
                                    }));
                                  }
                                }}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              >
                                <option value="">Select a test...</option>
                                {tests.map(test => (
                                  <option key={test.id} value={test.id}>
                                    {test.name} ({test.id})
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <button
                                onClick={() => handleRemoveParameter(index)}
                                className="text-gray-400 hover:text-red-500"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">No parameters added yet</p>
                  </div>
                )}
              </div>

              {/* Add Parameter Form */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Parameter</h4>
                <div className="overflow-x-auto mb-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Value</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Method</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mandatory</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            value={newParameter.name}
                            onChange={(e) => setNewParameter(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g., pH, Assay"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <select
                            value={newParameter.type}
                            onChange={(e) => setNewParameter(prev => ({ ...prev, type: e.target.value as SpecificationType }))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {PARAMETER_TYPES.map(type => (
                              <option key={type} value={type}>{type}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            value={newParameter.unit}
                            onChange={(e) => setNewParameter(prev => ({ ...prev, unit: e.target.value }))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g., %, pH units"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            value={newParameter.expectedValue}
                            onChange={(e) => setNewParameter(prev => ({ ...prev, expectedValue: e.target.value }))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g., 6.5-7.5"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <input
                            type="text"
                            value={newParameter.testMethod || ''}
                            onChange={(e) => setNewParameter(prev => ({ ...prev, testMethod: e.target.value }))}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="e.g., USP <791>"
                          />
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <input
                            type="checkbox"
                            checked={newParameter.mandatory}
                            onChange={(e) => setNewParameter(prev => ({ ...prev, mandatory: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <button
                  onClick={handleAddParameter}
                  disabled={!newParameter.name || !newParameter.expectedValue}
                  className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 inline mr-2" />
                  Add Parameter
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 mr-3"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!formData.name || formData.parameters.length === 0}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <Check className="w-4 h-4 mr-2" />
            Create Specification
          </button>
        </div>
      </div>
    </div>
  );
}