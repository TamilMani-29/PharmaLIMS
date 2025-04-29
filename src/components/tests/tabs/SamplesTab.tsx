import React, { useState } from 'react';
import { Plus, Save, CheckCircle, XCircle, AlertCircle, ArrowRight, BarChart, CheckSquare, HelpCircle } from 'lucide-react';
import { Test } from '../../../context/TestContext';
import { useSamples } from '../../../context/SampleContext';
import { useTests } from '../../../context/TestContext';
import { useSpecifications } from '../../../context/SpecificationContext';
import { useNavigate, useLocation } from 'react-router-dom';
import AddSampleModal from '../modals/AddSampleModal';

interface SamplesTabProps {
  test: Test;
}

export default function SamplesTab({ test }: SamplesTabProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showAddSample, setShowAddSample] = useState(false);
  const [resultInputs, setResultInputs] = useState<{[key: string]: string}>({});
  const { updateTest, updateStepStatus } = useTests();
  const { specifications } = useSpecifications();

  // Calculate test statistics
  const totalSamples = test.samples.length;
  const passingSamples = test.samples.filter(s => s.resultStatus === 'Pass').length;
  const failingSamples = test.samples.filter(s => s.resultStatus === 'Fail').length;
  const inconclusiveSamples = test.samples.filter(s => s.resultStatus === 'Inconclusive').length;
  const pendingSamples = totalSamples - passingSamples - failingSamples - inconclusiveSamples;
  
  // Calculate overall test result status
  let overallTestResult = 'Pending';
  if (totalSamples === 0) {
    overallTestResult = 'No Samples';
  } else if (failingSamples > 0) {
    overallTestResult = 'Failed';
  } else if (passingSamples > 0 && passingSamples === totalSamples) {
    overallTestResult = 'Passed';
  } else if (passingSamples > 0) {
    overallTestResult = 'Partially Passed';
  }

  // Get linked parameter if it exists
  const linkedParameter = test.parameterId && test.specificationId ? 
    specifications.find(s => s.id === test.specificationId)?.parameters.find(p => p.id === test.parameterId) 
    : null;

  // Function to determine if a result passes based on the expected value
  const determineResultStatus = (result: string, expectedValue: string): 'Pass' | 'Fail' | 'Inconclusive' => {
    if (!expectedValue || !result) return 'Inconclusive';
    
    // Handle numeric ranges (e.g., "6.5-7.5", "≤ 0.5", "NLT 80%")
    if (/[0-9]/.test(result) && /[0-9]/.test(expectedValue)) {
      const resultNum = parseFloat(result);
      
      // Check for range format (e.g., "6.5-7.5")
      if (expectedValue.includes('-')) {
        const [min, max] = expectedValue.split('-').map(v => parseFloat(v.trim()));
        return (resultNum >= min && resultNum <= max) ? 'Pass' : 'Fail';
      }
      
      // Check for "less than or equal to" format (e.g., "≤ 0.5", "NMT 0.5")
      if (expectedValue.includes('≤') || expectedValue.toLowerCase().includes('nmt')) {
        const maxValue = parseFloat(expectedValue.replace(/[^\d.-]/g, ''));
        return resultNum <= maxValue ? 'Pass' : 'Fail';
      }
      
      // Check for "greater than or equal to" format (e.g., "≥ 80%", "NLT 80%")
      if (expectedValue.includes('≥') || expectedValue.toLowerCase().includes('nlt')) {
        const minValue = parseFloat(expectedValue.replace(/[^\d.-]/g, ''));
        return resultNum >= minValue ? 'Pass' : 'Fail';
      }
      
      // Exact match for numeric values
      return Math.abs(resultNum - parseFloat(expectedValue)) < 0.001 ? 'Pass' : 'Fail';
    }
    
    // For text-based criteria (e.g., "White to off-white powder")
    // Check if the result contains the expected value or vice versa
    if (result.toLowerCase().includes(expectedValue.toLowerCase()) || 
        expectedValue.toLowerCase().includes(result.toLowerCase())) {
      return 'Pass';
    }
    
    // Default case
    return 'Inconclusive';
  };

  const handleNavigateToSample = (sampleId: string) => {
    const productId = location.pathname.split('/')[2];
    navigate(`/products/${productId}/samples/${sampleId}`);
  };

  const handleSaveResult = (sampleId: string) => {
    const sample = test.samples.find(s => s.sampleId === sampleId);
    if (!sample || !linkedParameter) return;
    
    const result = resultInputs[sampleId];
    if (!result) return;
    
    const resultStatus = determineResultStatus(result, linkedParameter.expectedValue);
    
    // Update the first step with the result
    if (sample.steps.length > 0) {
      updateStepStatus(test.id, sampleId, sample.steps[0].id, 'Complete', {
        results: result,
        resultDetails: '',
        resultStatus,
        acceptanceCriteria: linkedParameter.expectedValue,
        specificationId: test.specificationId,
        parameterId: test.parameterId
      });
    }
    
    // Clear the input
    setResultInputs(prev => {
      const newInputs = {...prev};
      delete newInputs[sampleId];
      return newInputs;
    });
  };

  const getResultStatusIcon = (status?: string) => {
    switch (status) {
      case 'Pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'Fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  return (
    <div>
      {/* Test Summary */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Test Results Summary</h3>
          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
            overallTestResult === 'Passed' ? 'bg-green-100 text-green-800' :
            overallTestResult === 'Failed' ? 'bg-red-100 text-red-800' :
            overallTestResult === 'Partially Passed' ? 'bg-yellow-100 text-yellow-800' :
            'bg-blue-100 text-blue-800'
          }`}>
            <div className="flex items-center">
              {overallTestResult === 'Passed' ? <CheckCircle className="w-4 h-4 mr-1.5" /> :
               overallTestResult === 'Failed' ? <XCircle className="w-4 h-4 mr-1.5" /> :
               overallTestResult === 'Partially Passed' ? <AlertCircle className="w-4 h-4 mr-1.5" /> :
               <HelpCircle className="w-4 h-4 mr-1.5" />}
              {overallTestResult}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-blue-800">Total Samples</span>
                <span className="text-xl font-bold text-blue-800">{totalSamples}</span>
              </div>
              <div className="mt-2">
                <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: '100%' }}></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-100 shadow-sm">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <CheckSquare className="w-4 h-4 mr-1.5 text-green-700" />
                  <span className="text-sm font-medium text-green-800">Passing</span>
                </div>
                <span className="text-xl font-bold text-green-800">{passingSamples}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-green-700">
                <span>{passingSamples > 0 && totalSamples > 0 ? Math.round((passingSamples / totalSamples) * 100) : 0}% of samples</span>
              </div>
              <div className="mt-2">
                <div className="w-full h-1.5 bg-green-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-600 rounded-full" style={{ width: `${totalSamples > 0 ? (passingSamples / totalSamples) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-lg p-4 border border-red-100 shadow-sm">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <XCircle className="w-4 h-4 mr-1.5 text-red-700" />
                  <span className="text-sm font-medium text-red-800">Failing</span>
                </div>
                <span className="text-xl font-bold text-red-800">{failingSamples}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-red-700">
                <span>{failingSamples > 0 && totalSamples > 0 ? Math.round((failingSamples / totalSamples) * 100) : 0}% of samples</span>
              </div>
              <div className="mt-2">
                <div className="w-full h-1.5 bg-red-200 rounded-full overflow-hidden">
                  <div className="h-full bg-red-600 rounded-full" style={{ width: `${totalSamples > 0 ? (failingSamples / totalSamples) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-100 shadow-sm">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <HelpCircle className="w-4 h-4 mr-1.5 text-yellow-700" />
                  <span className="text-sm font-medium text-yellow-800">Pending</span>
                </div>
                <span className="text-xl font-bold text-yellow-800">{pendingSamples}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-yellow-700">
                <span>{pendingSamples > 0 && totalSamples > 0 ? Math.round((pendingSamples / totalSamples) * 100) : 0}% of samples</span>
              </div>
              <div className="mt-2">
                <div className="w-full h-1.5 bg-yellow-200 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${totalSamples > 0 ? (pendingSamples / totalSamples) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Parameter Information */}
        {linkedParameter && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 shadow-sm">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Parameter Requirements</h4>
            <p className="text-sm text-blue-700">
              <span className="font-medium">Parameter:</span> {linkedParameter.name} ({linkedParameter.type})
            </p>
            <p className="text-sm text-blue-700 mt-1">
              <span className="font-medium">Expected Value:</span> {linkedParameter.expectedValue} {linkedParameter.unit}
            </p>
            {linkedParameter.testMethod && (
              <p className="text-sm text-blue-700 mt-1">
                <span className="font-medium">Test Method:</span> {linkedParameter.testMethod}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Add Sample Button */}
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowAddSample(true)}
          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Sample
        </button>
      </div>

      {/* Samples Table with Results Input */}
      <div className="bg-white rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sample ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sample Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Result
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Progress
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {test.samples.map((sample) => (
              <tr 
                key={sample.sampleId}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => {}}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {sample.sampleId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {sample.sampleName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    sample.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    sample.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {sample.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {sample.results ? (
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 mr-2">{sample.results}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        sample.resultStatus === 'Pass' ? 'bg-green-100 text-green-800' : 
                        sample.resultStatus === 'Fail' ? 'bg-red-100 text-red-800' : 
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {getResultStatusIcon(sample.resultStatus)}
                        <span className="ml-1">{sample.resultStatus || 'Pending'}</span>
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={resultInputs[sample.sampleId] || ''}
                        onChange={(e) => setResultInputs(prev => ({
                          ...prev,
                          [sample.sampleId]: e.target.value
                        }))}
                        placeholder={linkedParameter ? `Enter value (${linkedParameter.unit})` : "Enter result"}
                        className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleSaveResult(sample.sampleId)}
                        disabled={!resultInputs[sample.sampleId] || !linkedParameter}
                        className="p-1 text-blue-600 hover:text-blue-700 disabled:text-gray-400"
                      >
                        <Save className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-600 rounded-full"
                        style={{
                          width: `${(sample.steps.filter(step => step.status === 'Complete').length / sample.steps.length) * 100}%` 
                        }}
                      />
                    </div>
                    <span className="ml-2 text-xs text-gray-500">
                      {sample.steps.filter(step => step.status === 'Complete').length}/{sample.steps.length}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={(e) => handleNavigateToSample(sample.sampleId)}
                    className="text-blue-600 hover:text-blue-700 mr-3"
                  >
                    <ArrowRight className="w-4 h-4 inline mr-1" />
                    View Sample
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const updatedSamples = test.samples.filter(s => s.sampleId !== sample.sampleId);
                      updateTest(test.id, { samples: updatedSamples });
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {test.samples.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <p className="text-gray-500">No samples added to this test yet</p>
                  <button
                    onClick={() => setShowAddSample(true)}
                    className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50"
                  >
                    <Plus className="w-4 h-4 inline mr-2" />
                    Add Sample
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Sample Modal */}
      <AddSampleModal
        isOpen={showAddSample}
        onClose={() => setShowAddSample(false)}
        testId={test.id}
      />
    </div>
  );
}