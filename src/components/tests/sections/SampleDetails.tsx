import React, { useState } from 'react';
import { X, Clock, AlertCircle, CheckCircle, Save, Beaker, FileText, MessageSquare, PlayCircle, Play } from 'lucide-react';
import { SampleTest, TestStep, StepStatus } from '../../../context/TestContext';
import { useTests, Test } from '../../../context/TestContext';
import { useSpecifications } from '../../../context/SpecificationContext';

interface SampleDetailsProps {
  testId: string;
  sample: SampleTest;
  onClose: () => void;
}

export default function SampleDetails({ testId, sample, onClose }: SampleDetailsProps) {
  const { updateStepStatus, addStepNote } = useTests();
  const { specifications } = useSpecifications();
  const [stepNotes, setStepNotes] = useState<{ [stepId: string]: string }>({});
  const [activeTab, setActiveTab] = useState<'instructions' | 'results' | 'notes'>('instructions');
  const [testResults, setTestResults] = useState<{
    results: string;
    resultDetails: string;
  }>({
    results: sample.results || '',
    resultDetails: sample.resultDetails || '',
  });
  const [selectedStep, setSelectedStep] = useState<TestStep | null>(null);
  const { tests } = useTests();
  
  // Get the test to access specification and parameter info
  const test = tests.find(t => t.id === testId);

  // Get linked specification and parameter if they exist
  const linkedSpecification = test?.specificationId ? 
    specifications.find(spec => spec.id === test.specificationId) : null;
  
  const linkedParameter = linkedSpecification && test?.parameterId ? 
    linkedSpecification.parameters.find(param => param.id === test.parameterId) : null;

  // Function to determine if a result passes based on the expected value
  const determineResultStatus = (result: string): 'Pass' | 'Fail' | 'Inconclusive' => {
    if (!linkedParameter || !result) return 'Inconclusive';
    
    const expectedValue = linkedParameter.expectedValue;
    
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

  const getStatusColor = (status: StepStatus) => {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Complete':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: StepStatus) => {
    switch (status) {
      case 'Not Started':
        return <Clock className="w-4 h-4" />;
      case 'In Progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'Complete':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Get all specifications and their parameters for dropdown
  const specificationOptions = specifications.map(spec => ({
    id: spec.id,
    name: spec.name,
    parameters: spec.parameters.map(param => ({
      id: param.id,
      name: param.name,
      type: param.type,
      unit: param.unit,
      expectedValue: param.expectedValue
    }))
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Sample Details</h2>
            <p className="text-sm text-gray-500 mt-1">{sample.sampleId}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Sample Status */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700">Status</h3>
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sample.status)}`}>
                    {getStatusIcon(sample.status)}
                    <span className="ml-1">{sample.status}</span>
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Progress</h3>
                <div className="mt-2 flex items-center">
                  <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 rounded-full"
                      style={{ 
                        width: `${(sample.steps.filter(step => step.status === 'Complete').length / sample.steps.length) * 100}%` 
                      }}
                    />
                  </div>
                  <span className="ml-2 text-sm text-gray-500">
                    {sample.steps.filter(step => step.status === 'Complete').length}/{sample.steps.length} steps
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-700">Assigned To</h3>
                <div className="mt-2">
                  {test?.assignedTo ? (
                    <span className="text-sm text-gray-900">{test.assignedTo}</span>
                  ) : (
                    <span className="text-sm text-gray-500">Not assigned</span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Due Date */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-700">Due Date</h3>
                  <div className="mt-2">
                    {test?.dueDate ? (
                      <div className="flex items-center text-sm text-gray-900">
                        {new Date(test.dueDate).toLocaleDateString()}
                        {new Date(test.dueDate) < new Date() && test.status !== 'Completed' && (
                          <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                            Overdue
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not set</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs for Instructions and Results */}
          <div className="bg-white rounded-lg border border-gray-200 mb-6">
            <div className="border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab('instructions')}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === 'instructions' 
                      ? 'border-b-2 border-blue-500 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Beaker className="w-4 h-4 inline mr-2" />
                  Test Instructions
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === 'notes' 
                      ? 'border-b-2 border-blue-500 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 inline mr-2" />
                  Notes
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === 'results' 
                      ? 'border-b-2 border-blue-500 text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <FileText className="w-4 h-4 inline mr-2" />
                  Test Results
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {activeTab === 'instructions' && (
                <div className="space-y-4">
                  {sample.steps.map((step) => (
                    <div
                      key={step.id}
                      className={`bg-white rounded-lg border p-4 ${
                        selectedStep?.id === step.id ? 'border-blue-500 ring-1 ring-blue-500' : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedStep(selectedStep?.id === step.id ? null : step)}
                    >
                      <div className="grid grid-cols-12 gap-6">
                        {/* Left Side - Step Title and Status */}
                        <div className="col-span-4">
                          <div className="flex flex-col space-y-2">
                            <h4 className="text-sm font-medium text-gray-900">{step.name}</h4>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-fit ${getStatusColor(step.status)}`}>
                              {getStatusIcon(step.status)}
                              <span className="ml-1">{step.status}</span>
                            </span>
                            {step.status !== 'Complete' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const newStatus: StepStatus = step.status === 'Not Started'
                                    ? 'In Progress'
                                    : 'Complete';
                                    
                                  // Update the step status
                                  updateStepStatus(testId, sample.sampleId, step.id, newStatus);
                                  
                                  // If all steps are complete and this is the last step, prompt to enter final results
                                  const updatedSteps = sample.steps.map(s => 
                                    s.id === step.id ? { ...s, status: newStatus } : s
                                  );
                                  
                                  const isLastStep = step.id === sample.steps[sample.steps.length - 1].id;
                                  if (updatedSteps.every(s => s.status === 'Complete') && newStatus === 'Complete' && isLastStep) {
                                    setActiveTab('results');
                                  }
                                }}
                                className="px-3 py-1 text-sm font-medium text-blue-600 hover:text-blue-700 w-fit"
                              > 
                                {step.status === 'Not Started' ? 'Start Step' : 'Complete Step'}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Right Side - Instructions and Notes */}
                        <div className="col-span-8">
                          {/* Step Instructions */}
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">Step Instructions</h5>
                            <ul className="list-disc list-inside space-y-2">
                              {step.description.map((item, index) => (
                                <li key={index} className="text-sm text-gray-600">{item}</li>
                              ))}
                            </ul>
                          </div>

                          {/* Display Results if available */}
                          {step.results && (
                            <div className="mt-3 bg-green-50 rounded-lg p-3">
                              <h5 className="text-xs font-medium text-green-800 uppercase mb-1">Results</h5>
                              <p className="text-sm text-green-700">{step.results}</p>
                            </div>
                          )}

                          {/* Step Notes */}
                          <div className="space-y-3">
                            <h5 className="text-xs font-medium text-gray-500 uppercase">Notes</h5>
                            {step.notes?.map((note, index) => (
                              <div key={index} className="bg-white border border-gray-200 rounded p-3">
                                <div className="flex flex-col space-y-1">
                                  <p className="text-sm text-gray-600">{note.content}</p>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-gray-400">{note.user}</span>
                                    <span className="text-xs text-gray-400">•</span>
                                    <span className="text-xs text-gray-400">{new Date(note.timestamp).toLocaleString()}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                            <div className="flex space-x-2">
                              <input
                                type="text"
                                value={stepNotes[step.id] || ''}
                                onChange={(e) => setStepNotes(prev => ({ ...prev, [step.id]: e.target.value }))}
                                placeholder="Add a note..."
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                              <button
                                onClick={() => {
                                  const note = stepNotes[step.id];
                                  if (note && note.trim()) {
                                    addStepNote(testId, sample.sampleId, step.id, note, 'John Doe');
                                    setStepNotes(prev => ({ ...prev, [step.id]: '' }));
                                  }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                              >
                                Add
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {activeTab === 'results' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Result Value
                        </label>
                        {linkedParameter && (
                          <div className="text-sm text-blue-600">
                            Expected: {linkedParameter.expectedValue} {linkedParameter.unit}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={testResults.results}
                          onChange={(e) => setTestResults({...testResults, results: e.target.value})}
                          placeholder={linkedParameter ? 
                            `Enter value (${linkedParameter.unit})` : 
                            "e.g., 7.2 pH, 98.5% purity, etc."}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {linkedParameter?.unit && (
                          <span className="text-sm text-gray-500">{linkedParameter.unit}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Detailed Observations
                      </label>
                      <textarea
                        value={testResults.resultDetails}
                        onChange={(e) => setTestResults({...testResults, resultDetails: e.target.value})}
                        rows={4}
                        placeholder="Enter detailed observations, calculations, or any additional information about the test results..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    {/* Show linked specification info */}
                    {linkedSpecification && linkedParameter && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h3 className="text-sm font-medium text-blue-800 mb-2">Linked Specification</h3>
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Specification:</span> {linkedSpecification.name}
                      </p>
                      <p className="text-sm text-blue-700">
                        <span className="font-medium">Parameter:</span> {linkedParameter.name} ({linkedParameter.type})
                      </p>
                    </div>
                    )}
                    
                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        onClick={() => setActiveTab('instructions')}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                      >
                        Back to Instructions
                      </button>
                      <button
                        onClick={() => {
                          // Save the test results
                          const resultStatus = determineResultStatus(testResults.results);
                          
                          // Create the result data with automatically determined status
                          const resultData = {
                            ...testResults,
                            resultStatus,
                            acceptanceCriteria: linkedParameter ? linkedParameter.expectedValue : '',
                            specificationId: test?.specificationId,
                            parameterId: test?.parameterId
                          };
                          
                          updateStepStatus(testId, sample.sampleId, sample.steps[0].id, 'Complete', resultData);
                          
                          setActiveTab('instructions');
                        }}
                        className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Results
                      </button>
                        <div className="flex space-x-2">
                          {step.status !== 'Complete' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                const newStatus: StepStatus = step.status === 'Not Started'
                                  ? 'In Progress'
                                  : 'Complete';
                                  
                                // Update the step status
                                updateStepStatus(testId, sample.sampleId, step.id, newStatus);
                                
                                // If all steps are complete and this is the last step, prompt to enter final results
                                const updatedSteps = sample.steps.map(s => 
                                  s.id === step.id ? { ...s, status: newStatus } : s
                                );
                                
                                const isLastStep = step.id === sample.steps[sample.steps.length - 1].id;
                                if (updatedSteps.every(s => s.status === 'Complete') && newStatus === 'Complete' && isLastStep) {
                                  setActiveTab('results');
                                }
                              }}
                              className="flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                            > 
                              {step.status === 'Not Started' ? (
                                <>
                                  <Play className="w-3.5 h-3.5 mr-1.5" />
                                  Start Step
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
                                  Complete Step
                                </>
                              )}
                            </button>
                          )}
                          
                          {step.status === 'Complete' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Reopen step
                                updateStepStatus(testId, sample.sampleId, step.id, 'In Progress');
                              }}
                              className="flex items-center px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                            >
                              <Clock className="w-3.5 h-3.5 mr-1.5" />
                              Reopen
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Notes List */}
                      {step.notes && step.notes.length > 0 ? (
                        <div className="space-y-3 mb-4">
                          {step.notes.map((note, index) => (
                            <div key={index} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-900">{note.user}</span>
                                <span className="text-xs text-gray-500">{new Date(note.timestamp).toLocaleString()}</span>
                              </div>
                              <p className="text-sm text-gray-600">{note.content}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic mb-4">No notes for this step</p>
                      )}
                      
                      {/* Add Note Form */}
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 relative">
                          <MessageSquare className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            value={stepNotes[step.id] || ''}
                            onChange={(e) => setStepNotes(prev => ({ ...prev, [step.id]: e.target.value }))}
                            placeholder="Add a note about this step..."
                            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          onClick={() => {
                            const note = stepNotes[step.id];
                            if (note && note.trim()) {
                              addStepNote(testId, sample.sampleId, step.id, note, 'John Doe');
                              setStepNotes(prev => ({ ...prev, [step.id]: '' }));
                            }
                          }}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex-shrink-0"
                        >
                          Add Note
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}