import React, { useState } from 'react';
import { X, Search, Link2 } from 'lucide-react';
import { useSpecifications, SpecificationParameter } from '../../../context/SpecificationContext';
import { useTests } from '../../../context/TestContext';

interface LinkParameterToTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  specificationId: string;
  testId: string;
}

export default function LinkParameterToTestModal({
  isOpen,
  onClose,
  specificationId,
  testId
}: LinkParameterToTestModalProps) {
  const { specifications, linkTestToParameter } = useSpecifications();
  const { tests } = useTests();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedParameterIds, setSelectedParameterIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const specification = specifications.find(s => s.id === specificationId);
  const test = tests.find(t => t.id === testId);
  
  if (!specification || !test) return null;

  // Filter parameters that aren't already linked to this test
  const availableParameters = specification.parameters.filter(param => 
    !param.linkedTestIds?.includes(testId) &&
    (param.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     param.type.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleLinkParameters = () => {
    selectedParameterIds.forEach(parameterId => {
      linkTestToParameter(specificationId, parameterId, testId);
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Link Parameters to Test</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search parameters..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Selected Parameters */}
          {selectedParameterIds.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Parameters</h3>
              <div className="space-y-2">
                {selectedParameterIds.map(parameterId => {
                  const parameter = specification.parameters.find(p => p.id === parameterId);
                  return (
                    <div
                      key={parameterId}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900">{parameter?.id} - {parameter?.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({parameter?.type})</span>
                      </div>
                      <button
                        onClick={() => setSelectedParameterIds(prev => prev.filter(id => id !== parameterId))}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Parameters */}
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
            {availableParameters.map(parameter => (
              <div
                key={parameter.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedParameterIds(prev => [...prev, parameter.id])}
              >
                <div>
                  <span className="text-sm font-medium text-gray-900">{parameter.id} - {parameter.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({parameter.type})</span>
                  <div className="text-xs text-gray-500 mt-1">
                    Expected: {parameter.expectedValue} {parameter.unit}
                  </div>
                </div>
                <Link2 className="w-4 h-4 text-gray-400" />
              </div>
            ))}
            {availableParameters.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                No parameters available to link
              </div>
            )}
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
            onClick={handleLinkParameters}
            disabled={selectedParameterIds.length === 0}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Link Selected Parameters
          </button>
        </div>
      </div>
    </div>
  );
}