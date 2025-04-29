import React from 'react';
import { useState, useEffect } from 'react';
import { Test, useTests, StepStatus } from '../../../context/TestContext';
import { SpecificationParameter } from '../../../context/SpecificationContext';
import { Beaker, CheckCircle, Clock, AlertCircle, Edit2, Plus, Save, X, Trash2, Play, Upload, PlayCircle, Trash, MessageSquare } from 'lucide-react';

interface TestInstructionsTabProps {
  test: Test;
  parameter?: SpecificationParameter | null;
  isFromTestMaster?: boolean;
}

export default function TestInstructionsTab({ test, parameter, isFromTestMaster = false }: TestInstructionsTabProps) {
  const { updateTest } = useTests();
  const [isEditing, setIsEditing] = useState(false);
  const [editedDescription, setEditedDescription] = useState(test.description);
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [newStepName, setNewStepName] = useState('');
  const [newStepInstructions, setNewStepInstructions] = useState<string[]>(['']);
  const [showAddStepForm, setShowAddStepForm] = useState(false);
  const [stepResults, setStepResults] = useState<{[stepId: string]: string}>({});
  const [stepNotes, setStepNotes] = useState<{[stepId: string]: string}>({});
  const [stepFiles, setStepFiles] = useState<{[stepId: string]: File[]}>({});
  const [selectedStep, setSelectedStep] = useState<string | null>(null);

  // State for deleting a step
  const [showDeleteStepModal, setShowDeleteStepModal] = useState(false);
  const [stepToDelete, setStepToDelete] = useState<string | null>(null);

  // Collect all steps from all samples
  const allSteps = test.samples.flatMap(sample => 
    sample.steps.map(step => ({
      ...step,
      sampleId: sample.sampleId,
      sampleName: sample.sampleName
    }))
  );

  // Group steps by name to show common instructions
  const uniqueStepNames = [...new Set(allSteps.map(step => step.name))];
  
  const getStepInstructions = (stepName: string) => {
    const step = allSteps.find(s => s.name === stepName);
    return step?.description || [];
  };

  const getStepById = (stepName: string) => {
    return allSteps.find(s => s.name === stepName);
  };

  const getStepStatus = (stepName: string) => {
    const steps = allSteps.filter(s => s.name === stepName);
    if (steps.every(s => s.status === 'Complete')) return 'Complete';
    if (steps.some(s => s.status === 'In Progress')) return 'In Progress';
    return 'Not Started';
  };

  const handleSaveDescription = () => {
    updateTest(test.id, { description: editedDescription });
    setIsEditing(false);
  };

  const handleAddInstruction = () => {
    setNewStepInstructions([...newStepInstructions, '']);
  };

  const handleUpdateInstruction = (index: number, value: string) => {
    const updatedInstructions = [...newStepInstructions];
    updatedInstructions[index] = value;
    setNewStepInstructions(updatedInstructions);
  };

  const handleRemoveInstruction = (index: number) => {
    if (newStepInstructions.length > 1) {
      const updatedInstructions = [...newStepInstructions];
      updatedInstructions.splice(index, 1);
      setNewStepInstructions(updatedInstructions);
    }
  };

  const handleAddStep = () => {
    // Filter out empty instructions
    const filteredInstructions = newStepInstructions.filter(instruction => instruction.trim() !== '');
    
    if (newStepName.trim() === '' || filteredInstructions.length === 0) {
      alert('Please provide a step name and at least one instruction');
      return;
    }

    // Create a new step template that will be added to all samples
    const newStep = {
      id: `STP-${Date.now()}`,
      name: newStepName,
      description: filteredInstructions,
      status: 'Not Started' as const
    };

    // Update all samples with the new step
    const updatedSamples = test.samples.map(sample => ({
      ...sample,
      steps: [...sample.steps, { ...newStep }]
    }));

    // Update the test with the new samples
    updateTest(test.id, { samples: updatedSamples });

    // Reset form
    setNewStepName('');
    setNewStepInstructions(['']);
    setShowAddStepForm(false);
  };

  const handleStartStep = (stepName: string) => {
    // Find all instances of this step across samples
    const step = getStepById(stepName);
    if (!step) return;
    
    // Update all samples with this step
    const updatedSamples = test.samples.map(sample => ({
      ...sample,
      steps: sample.steps.map(s => {
        if (s.name === stepName && s.status === 'Not Started') {
          return {
            ...s,
            status: 'In Progress',
            startTime: new Date().toISOString() // Record start time
          };
        }
        return s;
      })
    }));
    
    updateTest(test.id, { samples: updatedSamples });
  };

  const handleCompleteStep = (stepName: string) => {
    // Find all instances of this step across samples
    const step = getStepById(stepName);
    if (!step) return;
    
    // Update all samples with this step
    const updatedSamples = test.samples.map(sample => ({
      ...sample,
      steps: sample.steps.map(s => {
        if (s.name === stepName && s.status === 'In Progress') {
          return {
            ...s,
            status: 'Complete',
            completionTime: new Date().toISOString(), // Record completion time
            results: stepResults[stepName] || '' // Save the results
          };
        }
        return s;
      })
    }));
    
    updateTest(test.id, { samples: updatedSamples });
  };

  const handleDeleteStep = (stepName: string) => {
    // Update all samples to remove this step
    const updatedSamples = test.samples.map(sample => ({
      ...sample,
      steps: sample.steps.filter(s => s.name !== stepName)
    }));
    
    updateTest(test.id, { samples: updatedSamples });
    setShowDeleteStepModal(false);
    setStepToDelete(null);
  };

  const handleFileUpload = (stepName: string, files: FileList) => {
    const fileArray = Array.from(files);
    setStepFiles(prev => ({
      ...prev,
      [stepName]: [...(prev[stepName] || []), ...fileArray]
    }));
    
    // In a real app, you would upload these files to a server
    // For now, we'll just update the step with a note about the files
    if (fileArray.length > 0) {
      const fileNames = fileArray.map(f => f.name).join(', ');
      const fileNote = `Files uploaded: ${fileNames}`;
      
      setStepResults(prev => ({
        ...prev,
        [stepName]: prev[stepName] ? `${prev[stepName]}\n${fileNote}` : fileNote
      }));
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Complete':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Complete':
        return <CheckCircle className="w-4 h-4" />;
      case 'In Progress':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Parameter Information */}
      {parameter && (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-medium text-blue-900">Parameter Information</h2>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-blue-800">
                <span className="font-medium">Parameter:</span> {parameter.id} - {parameter.name}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <span className="font-medium">Type:</span> {parameter.type}
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-800">
                <span className="font-medium">Expected Value:</span> {parameter.expectedValue} {parameter.unit}
              </p>
              <p className="text-sm text-blue-800 mt-1">
                <span className="font-medium">Test Method:</span> {parameter.testMethod || 'Not specified'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Test Method Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center flex-1">
            <Beaker className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Test Method</h2>
          </div>
          {isFromTestMaster && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center text-blue-600 hover:text-blue-700"
            >
              <Edit2 className="w-4 h-4 mr-1" />
              {isEditing ? 'Cancel' : 'Edit Description'}
            </button>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
          {isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setEditedDescription(test.description);
                    setIsEditing(false);
                  }}
                  className="px-3 py-1 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveDescription}
                  className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600">{test.description}</p>
          )}
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">SOP Reference</h3>
          <p className="text-sm text-gray-600">{test.sopId}</p>
        </div>
        
        {/* Test Steps */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-700">Test Procedure</h3>
            {isFromTestMaster && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowAddStepForm(!showAddStepForm)}
                  className="flex items-center text-blue-600 hover:text-blue-700 text-sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Step
                </button>
              </div>
            )}
          </div>
          
          {/* Add New Step Form */}
          {showAddStepForm && (
            <div className="bg-blue-50 rounded-lg p-4 mb-6 border border-blue-100">
              <h4 className="text-sm font-medium text-blue-800 mb-3">Add New Step</h4>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Step Name
                  </label>
                  <input
                    type="text"
                    value={newStepName}
                    onChange={(e) => setNewStepName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Sample Preparation, pH Measurement"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Instructions
                  </label>
                  <div className="space-y-2">
                    {newStepInstructions.map((instruction, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={instruction}
                          onChange={(e) => handleUpdateInstruction(index, e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder={`Instruction ${index + 1}`}
                        />
                        <button
                          onClick={() => handleRemoveInstruction(index)}
                          className="text-red-500 hover:text-red-700"
                          disabled={newStepInstructions.length <= 1}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={handleAddInstruction}
                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Instruction
                    </button>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-2">
                  <button
                    onClick={() => {
                      setNewStepName('');
                      setNewStepInstructions(['']);
                      setShowAddStepForm(false);
                    }}
                    className="px-3 py-1 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddStep}
                    className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    Add Step
                  </button>
                </div>
              </div>
            </div>
          )}
          
          <div className="space-y-6">
            {uniqueStepNames.map((stepName, index) => {
              const stepStatus = getStepStatus(stepName);
              const instructions = getStepInstructions(stepName);
              const currentStep = getStepById(stepName);
              
              return (
                <div key={stepName} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                        <span className="text-blue-800 text-sm font-medium">{index + 1}</span>
                      </div>
                      <div className="flex items-center">
                        <h4 className="text-md font-medium text-gray-900">{stepName}</h4>
                        {isFromTestMaster && (
                          <div className="ml-2 flex space-x-2">
                            <button
                              onClick={() => setEditingStepIndex(editingStepIndex === index ? null : index)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setStepToDelete(stepName);
                                setShowDeleteStepModal(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Step Controls and Results */}
                  {!isFromTestMaster && (
                    <div className="ml-9 mt-4 border-t border-gray-200 pt-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-xs font-medium text-gray-500 uppercase">Step Controls</h5>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(stepStatus)}`}>
                          {getStatusIcon(stepStatus)}
                          <span className="ml-1">{stepStatus}</span>
                        </span>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex space-x-3 mb-4">
                        {stepStatus === 'Not Started' && (
                          <>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleStartStep(stepName)}
                                className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                              >
                                <PlayCircle className="w-4 h-4 mr-1.5" />
                                Start Step
                              </button>
                              <div className="relative group">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedStep(selectedStep === stepName ? null : stepName);
                                  }}
                                  className="px-2 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                                >
                                  <span className="sr-only">More options</span>
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                  </svg>
                                </button>
                                
                                {selectedStep === stepName && (
                                  <div className="absolute left-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Add note functionality
                                        setSelectedStep(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <MessageSquare className="w-4 h-4 inline mr-2" />
                                      Add Note
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Skip step functionality
                                        const updatedSamples = test.samples.map(sample => ({
                                          ...sample,
                                          steps: sample.steps.map(s => {
                                            if (s.name === stepName) {
                                              return {
                                                ...s,
                                                status: 'Complete',
                                                completionTime: new Date().toISOString(),
                                                results: 'Step skipped'
                                              };
                                            }
                                            return s;
                                          })
                                        }));
                                        updateTest(test.id, { samples: updatedSamples });
                                        setSelectedStep(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    >
                                      <Play className="w-4 h-4 inline mr-2" />
                                      Skip Step
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </>
                        )}
                        
                        {stepStatus === 'In Progress' && (
                          <button
                            onClick={() => handleCompleteStep(stepName)}
                            className="flex items-center px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4 mr-1.5" />
                            Complete Step
                          </button>
                        )}
                      </div>
                      
                      {/* Results Input */}
                      {stepStatus === 'In Progress' && (
                        <div className="space-y-3">
                          <h5 className="text-xs font-medium text-gray-500 uppercase">Step Results</h5>
                          
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={stepResults[stepName] || ''}
                              onChange={(e) => setStepResults(prev => ({
                                ...prev,
                                [stepName]: e.target.value
                              }))}
                              placeholder="Enter results for this step..."
                              className="w-40 px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            
                            <div className="flex items-center space-x-2">
                              <label className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                                <Upload className="w-4 h-4 mr-2" />
                                Upload Files
                                <input
                                  type="file"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => {
                                    if (e.target.files && e.target.files.length > 0) {
                                      handleFileUpload(stepName, e.target.files);
                                    }
                                  }}
                                />
                              </label>
                              
                              {stepFiles[stepName] && stepFiles[stepName].length > 0 && (
                                <span className="text-xs text-gray-500">
                                  {stepFiles[stepName].length} file(s) selected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {currentStep?.results && (
                        <div className="mt-3 bg-green-50 rounded-lg p-3">
                          <h5 className="text-xs font-medium text-green-800 uppercase mb-1">Results</h5>
                          <p className="text-sm text-green-700">{currentStep.results}</p>
                        </div>
                      )}
                      
                      {/* Step Notes */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="text-xs font-medium text-gray-500 uppercase">
                            Notes
                          </h5>
                          <span className="text-xs text-gray-500">{currentStep?.notes?.length || 0} notes</span>
                        </div>
                        
                        {/* Notes List */}
                        {currentStep?.notes && currentStep.notes.length > 0 ? (
                          <div className="space-y-3 mb-3">
                            {currentStep.notes.map((note, index) => (
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
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic mb-3">No notes added yet</p>
                        )}
                        
                        {/* Add Note Form */}
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 relative">
                            <MessageSquare className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={stepNotes[stepName] || ''}
                              onChange={(e) => setStepNotes(prev => ({ ...prev, [stepName]: e.target.value }))}
                              placeholder="Add a note about this step..."
                              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <button
                            onClick={() => {
                              const note = stepNotes[stepName];
                              if (note && note.trim() && currentStep) {
                                const updatedSamples = test.samples.map(sample => ({
                                  ...sample,
                                  steps: sample.steps.map(s => {
                                    if (s.name === stepName) {
                                      return {
                                        ...s,
                                        notes: [
                                          ...(s.notes || []),
                                          {
                                            content: note,
                                            user: 'John Doe',
                                            timestamp: new Date().toISOString()
                                          }
                                        ]
                                      };
                                    }
                                    return s;
                                  })
                                }));
                                updateTest(test.id, { samples: updatedSamples });
                                setStepNotes(prev => ({ ...prev, [stepName]: '' }));
                              }
                            }}
                            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex-shrink-0"
                          >
                            Add Note
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="ml-9">
                    <h5 className="text-xs font-medium text-gray-500 uppercase mb-2">Instructions</h5>
                    {editingStepIndex === index && isFromTestMaster ? (
                      <div className="space-y-2">
                        {instructions.map((instruction, i) => (
                          <div key={i} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={instruction}
                              onChange={(e) => {
                                const updatedInstructions = [...instructions];
                                updatedInstructions[i] = e.target.value;
                                
                                // Update all samples with this step
                                const updatedSamples = test.samples.map(sample => ({
                                  ...sample,
                                  steps: sample.steps.map(step => {
                                    if (step.name === stepName) {
                                      return {
                                        ...step,
                                        description: updatedInstructions
                                      };
                                    }
                                    return step;
                                  })
                                }));
                                
                                updateTest(test.id, { samples: updatedSamples });
                              }}
                              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                              onClick={() => {
                                if (instructions.length > 1) {
                                  const updatedInstructions = [...instructions];
                                  updatedInstructions.splice(i, 1);
                                  
                                  // Update all samples with this step
                                  const updatedSamples = test.samples.map(sample => ({
                                    ...sample,
                                    steps: sample.steps.map(step => {
                                      if (step.name === stepName) {
                                        return {
                                          ...step,
                                          description: updatedInstructions
                                        };
                                      }
                                      return step;
                                    })
                                  }));
                                  
                                  updateTest(test.id, { samples: updatedSamples });
                                }
                              }}
                              className="text-red-500 hover:text-red-700"
                              disabled={instructions.length <= 1}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              const updatedInstructions = [...instructions, ''];
                              
                              // Update all samples with this step
                              const updatedSamples = test.samples.map(sample => ({
                                ...sample,
                                steps: sample.steps.map(step => {
                                  if (step.name === stepName) {
                                    return {
                                      ...step,
                                      description: updatedInstructions
                                    };
                                  }
                                  return step;
                                })
                              }));
                              
                              updateTest(test.id, { samples: updatedSamples });
                            }}
                            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Instruction
                          </button>
                          <button
                            onClick={() => setEditingStepIndex(null)}
                            className="text-sm text-gray-600 hover:text-gray-700"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    ) : (
                      <ol className="list-decimal list-inside space-y-2">
                        {instructions.map((instruction, i) => (
                          <li key={i} className="text-sm text-gray-600">{instruction}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Delete Step Confirmation Modal */}
      {showDeleteStepModal && stepToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[400px]">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">Delete Step</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete the step "{stepToDelete}"? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteStepModal(false);
                  setStepToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 mr-3"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteStep(stepToDelete)}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}