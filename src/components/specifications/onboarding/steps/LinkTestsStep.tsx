import React, { useState } from 'react';
import { Search, Link2, Plus, X } from 'lucide-react';
import { SpecificationType } from '../../../../context/SpecificationContext';
import { Test } from '../../../../context/TestContext';

interface LinkTestsStepProps {
  generatedSpecs: Array<{
    name: string;
    description: string;
    parameters: Array<{
      name: string;
      type: SpecificationType;
      unit: string;
      expectedValue: string;
      testMethod?: string;
      mandatory: boolean;
    }>;
  }>;
  tests: Test[];
  parameterTestLinks: Record<string, string>;
  setParameterTestLinks: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}

export default function LinkTestsStep({ 
  generatedSpecs, 
  tests, 
  parameterTestLinks, 
  setParameterTestLinks 
}: LinkTestsStepProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTestModal, setShowNewTestModal] = useState(false);
  
  // Filter tests based on search query
  const filteredTests = tests.filter(test => 
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    test.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handle linking a test to a parameter
  const handleLinkTest = (specName: string, paramName: string, testId: string) => {
    const paramKey = `${specName}-${paramName}`;
    setParameterTestLinks(prev => ({
      ...prev,
      [paramKey]: testId
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Link Tests to Parameters</h3>
        <p className="text-sm text-blue-700">
          Connect your parameters to specific tests to verify acceptance criteria. This helps ensure that all quality attributes are properly tested.
        </p>
      </div>

      {/* Test Search */}
      <div className="flex items-center justify-between mb-4">
        <div className="relative w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tests..."
            className="pl-9 pr-4 py-2 w-full text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Parameters Table with Test Linking */}
      {generatedSpecs.map((spec, specIndex) => (
        <div key={specIndex} className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
          <h4 className="font-medium text-gray-900 mb-2">{spec.name}</h4>
          <p className="text-sm text-gray-500 mb-4">{spec.description}</p>
          
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
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {spec.parameters.map((param, pIndex) => {
                  const paramKey = `${spec.name}-${param.name}`;
                  const linkedTestId = parameterTestLinks[paramKey];
                  const linkedTest = tests.find(t => t.id === linkedTestId);
                  
                  return (
                    <tr key={pIndex}>
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{param.name}</div>
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
                      <td className="px-3 py-2 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          {param.mandatory ? 'Yes' : 'No'}
                        </div>
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap">
                        {linkedTest ? (
                          <div className="flex items-center">
                            <span className="text-sm text-blue-600 font-medium">{linkedTest.name}</span>
                            <button 
                              onClick={() => handleLinkTest(spec.name, param.name, '')}
                              className="ml-2 text-gray-400 hover:text-gray-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <select
                            value=""
                            onChange={(e) => handleLinkTest(spec.name, param.name, e.target.value)}
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="">Select a test...</option>
                            {filteredTests.map(test => (
                              <option key={test.id} value={test.id}>
                                {test.name} ({test.id})
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Test Linking Guidance</h4>
        <p className="text-sm text-yellow-700">
          Linking tests to parameters ensures traceability between specifications and test results.
        </p>
        <ul className="mt-2 space-y-1 text-sm text-yellow-700 list-disc list-inside">
          <li>Each parameter should be linked to at least one test</li>
          <li>Tests can be linked to multiple parameters if they verify multiple attributes</li>
          <li>If no suitable test exists, create a new test first</li>
        </ul>
      </div>
    </div>
  );
}