import React, { useState } from 'react';
import { X, Plus, Search, AlertCircle, Check, ChevronDown, Trash2, Edit2 } from 'lucide-react';
import { useTests, TestType, Test } from '../../../context/TestContext';
import { useLocation } from 'react-router-dom';
import { useEquipment } from '../../../context/EquipmentContext';
import { useInventory } from '../../../context/InventoryContext';
import { Listbox, Transition } from '@headlessui/react';

interface NewTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  specificationId?: string;
  parameterId?: string;
  onTestCreated?: (testId: string) => void;
}

const TEST_TYPES: TestType[] = [
  'Chemical Analysis',
  'Physical Testing',
  'Stability Study',
  'Microbial Testing',
  'Method Validation'
];

// Mock SOP data with instructions
const MOCK_SOPS = [
  { 
    id: 'SOP-001', 
    name: 'pH Analysis Protocol', 
    version: '1.0',
    steps: [
      {
        name: 'Sample Preparation',
        instructions: [
          'Ensure all required materials are available and at room temperature',
          'Label sample containers with unique identifiers',
          'Prepare buffer solutions according to specifications',
          'Document initial sample weight and volume measurements'
        ]
      },
      {
        name: 'pH Measurement',
        instructions: [
          'Calibrate pH meter using standard buffer solutions (pH 4.0, 7.0, and 10.0)',
          'Verify calibration accuracy with a check standard',
          'Rinse electrode with deionized water between measurements',
          'Measure sample pH in triplicate and record all readings',
          'Calculate average pH value and standard deviation'
        ]
      }
    ]
  },
  { 
    id: 'SOP-002', 
    name: 'Stability Testing Protocol', 
    version: '2.1',
    steps: [
      {
        name: 'Initial Assessment',
        instructions: [
          'Document initial appearance, color, and physical state',
          'Record initial weight or volume',
          'Take photographs if required by protocol',
          'Prepare stability chambers according to ICH guidelines'
        ]
      },
      {
        name: 'Storage Conditions Setup',
        instructions: [
          'Place samples in appropriate stability chambers',
          'Set temperature and humidity according to protocol',
          'Verify and document chamber conditions',
          'Set up monitoring system for chamber conditions'
        ]
      },
      {
        name: 'Periodic Testing',
        instructions: [
          'Remove samples at designated time points',
          'Perform appearance and physical state assessment',
          'Conduct chemical analysis according to protocol',
          'Document all results and observations'
        ]
      }
    ]
  },
  { 
    id: 'SOP-003', 
    name: 'Microbial Testing Protocol', 
    version: '1.2',
    steps: [
      {
        name: 'Sample Preparation',
        instructions: [
          'Prepare sterile work area and equipment',
          'Prepare sample dilutions according to protocol',
          'Label all plates and tubes',
          'Document sample preparation details'
        ]
      },
      {
        name: 'Inoculation',
        instructions: [
          'Transfer sample to appropriate growth media',
          'Use aseptic technique throughout the procedure',
          'Include positive and negative controls',
          'Incubate at specified temperature and duration'
        ]
      },
      {
        name: 'Enumeration and Identification',
        instructions: [
          'Count colonies on plates',
          'Calculate CFU/g or CFU/mL',
          'Perform identification tests as required',
          'Document all results and observations'
        ]
      }
    ]
  }
];

export default function NewTestModal({ isOpen, onClose, specificationId, parameterId, onTestCreated }: NewTestModalProps) {
  const { addTest } = useTests();
  const location = useLocation();
  const { equipment } = useEquipment();
  const { items } = useInventory();
  const isTestMasterPage = location.pathname.includes('test-master');
  const [selectedSOP, setSelectedSOP] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Chemical Analysis' as TestType,
    specificationId: specificationId || '',
    parameterId: parameterId || '',
    description: '',
    sopId: '',
    startDate: '',
    assignedTo: '',
    selectedSamples: [] as string[],
    selectedEquipment: [] as string[],
    selectedInventory: [] as string[],
  });
  
  // State for custom steps when not using SOP template
  const [customSteps, setCustomSteps] = useState<Array<{
    name: string;
    instructions: string[];
  }>>([]);
  
  // State for editing SOP steps
  const [editedSOPSteps, setEditedSOPSteps] = useState<Array<{
    name: string;
    instructions: string[];
  }>>([]);
  
  // State for editing a custom step
  const [editingCustomStepIndex, setEditingCustomStepIndex] = useState<number | null>(null);
  const [editedCustomStep, setEditedCustomStep] = useState<{
    name: string;
    instructions: string[];
  }>({ name: '', instructions: [''] });
  
  // State for adding a new step
  const [newStep, setNewStep] = useState({
    name: '',
    instructions: ['']
  });
  
  // State for showing the add step form
  const [showAddStepForm, setShowAddStepForm] = useState(false);

  const [searchQueries, setSearchQueries] = useState({
    equipment: '',
    inventory: '',
  });
  
  if (!isOpen) return null;

  // Handle SOP selection
  const handleSOPChange = (sopId: string) => {
    const sop = MOCK_SOPS.find(s => s.id === sopId);
    setSelectedSOP(sop);
    setFormData(prev => ({ ...prev, sopId }));
    
    if (sop) {
      // Initialize edited steps with SOP steps
      setEditedSOPSteps(sop.steps.map(step => ({ ...step })));
    } else {
      setEditedSOPSteps([]);
    }
  };
  
  // Add instruction to a step
  const addInstructionToStep = (stepIndex: number) => {
    const updatedSteps = [...editedSOPSteps];
    updatedSteps[stepIndex].instructions.push('');
    setEditedSOPSteps(updatedSteps);
  };
  
  // Update instruction in a step
  const updateStepInstruction = (stepIndex: number, instructionIndex: number, value: string) => {
    const updatedSteps = [...editedSOPSteps];
    updatedSteps[stepIndex].instructions[instructionIndex] = value;
    setEditedSOPSteps(updatedSteps);
  };
  
  // Remove instruction from a step
  const removeStepInstruction = (stepIndex: number, instructionIndex: number) => {
    if (editedSOPSteps[stepIndex].instructions.length <= 1) return;
    
    const updatedSteps = [...editedSOPSteps];
    updatedSteps[stepIndex].instructions.splice(instructionIndex, 1);
    setEditedSOPSteps(updatedSteps);
  };
  
  // Add a new custom step
  const addCustomStep = () => {
    if (!newStep.name || newStep.instructions.some(i => !i.trim())) {
      alert('Please provide a step name and valid instructions');
      return;
    }
    
    setCustomSteps([...customSteps, { ...newStep }]);
    setNewStep({ name: '', instructions: [''] });
    setShowAddStepForm(false);
  };
  
  // Edit a custom step
  const startEditingCustomStep = (index: number) => {
    setEditingCustomStepIndex(index);
    setEditedCustomStep({ ...customSteps[index] });
  };
  
  // Save edited custom step
  const saveEditedCustomStep = () => {
    if (editingCustomStepIndex === null) return;
    
    if (!editedCustomStep.name || editedCustomStep.instructions.some(i => !i.trim())) {
      alert('Please provide a step name and valid instructions');
      return;
    }
    
    const updatedSteps = [...customSteps];
    updatedSteps[editingCustomStepIndex] = { ...editedCustomStep };
    setCustomSteps(updatedSteps);
    setEditingCustomStepIndex(null);
  };
  
  // Delete a custom step
  const deleteCustomStep = (index: number) => {
    const updatedSteps = [...customSteps];
    updatedSteps.splice(index, 1);
    setCustomSteps(updatedSteps);
  };
  
  // Add instruction to edited custom step
  const addEditedCustomStepInstruction = () => {
    setEditedCustomStep({
      ...editedCustomStep,
      instructions: [...editedCustomStep.instructions, '']
    });
  };
  
  // Update instruction in edited custom step
  const updateEditedCustomStepInstruction = (index: number, value: string) => {
    const updatedInstructions = [...editedCustomStep.instructions];
    updatedInstructions[index] = value;
    setEditedCustomStep({
      ...editedCustomStep,
      instructions: updatedInstructions
    });
  };
  
  // Remove instruction from edited custom step
  const removeEditedCustomStepInstruction = (index: number) => {
    if (editedCustomStep.instructions.length <= 1) return;
    
    const updatedInstructions = [...editedCustomStep.instructions];
    updatedInstructions.splice(index, 1);
    setEditedCustomStep({
      ...editedCustomStep,
      instructions: updatedInstructions
    });
  };
  
  // Add instruction to new step
  const addNewStepInstruction = () => {
    setNewStep({
      ...newStep,
      instructions: [...newStep.instructions, '']
    });
  };
  
  // Update instruction in new step
  const updateNewStepInstruction = (index: number, value: string) => {
    const updatedInstructions = [...newStep.instructions];
    updatedInstructions[index] = value;
    setNewStep({
      ...newStep,
      instructions: updatedInstructions
    });
  };
  
  // Remove instruction from new step
  const removeNewStepInstruction = (index: number) => {
    if (newStep.instructions.length <= 1) return;
    
    const updatedInstructions = [...newStep.instructions];
    updatedInstructions.splice(index, 1);
    setNewStep({
      ...newStep,
      instructions: updatedInstructions
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare test steps based on SOP or custom steps
    const testSteps = selectedSOP 
      ? editedSOPSteps 
      : customSteps;
      
    // Create sample steps for the test
    const sampleSteps = testSteps.map((step, index) => ({
      id: `STP-${index + 1}`,
      name: step.name,
      description: step.instructions,
      status: 'Not Started' as const
    }));

    const newTest: Omit<Test, 'id' | 'notes'> = {
      name: formData.name,
      type: formData.type,
      specificationId: formData.specificationId || undefined,
      parameterId: formData.parameterId || undefined,
      description: formData.description,
      createdDate: new Date().toISOString(),
      startDate: formData.startDate,
      status: 'Not Started',
      sopId: formData.sopId,
      assignedTo: formData.assignedTo,
      samples: [
        {
          sampleId: 'TEMPLATE',
          sampleName: 'Template',
          status: 'Not Started',
          steps: sampleSteps
        }
      ],
      resources: [
        ...formData.selectedEquipment.map(equipId => ({
          id: equipId,
          type: 'equipment' as const,
          name: equipment.find(e => e.id === equipId)?.name || '',
        })),
        ...formData.selectedInventory.map(itemId => ({
          id: itemId,
          type: 'inventory' as const,
          name: items.find(i => i.id === itemId)?.name || '',
        }))
      ]
    };

    // Get the new test ID and call the callback if provided
    const newTestId = addTest(newTest);
    if (onTestCreated) {
      onTestCreated(newTestId);
    }
    
    onClose();
  };

  const filteredEquipment = equipment.filter(item =>
    !formData.selectedEquipment.includes(item.id) &&
    (item.name.toLowerCase().includes(searchQueries.equipment.toLowerCase()) ||
     item.id.toLowerCase().includes(searchQueries.equipment.toLowerCase()))
  );

  const filteredInventory = items.filter(item =>
    !formData.selectedInventory.includes(item.id) &&
    (item.name.toLowerCase().includes(searchQueries.inventory.toLowerCase()) ||
     item.id.toLowerCase().includes(searchQueries.inventory.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Test Method</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <h3 className="text-sm font-medium text-blue-800 mb-2">Test Information</h3>
                <p className="text-sm text-blue-700">
                  Create a new test method by providing the information below. This will be added to the test library.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Name
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
                    Test Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TestType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    {TEST_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SOP Reference
                  </label>
                  <div className="relative">
                    <select
                      value={formData.sopId}
                      onChange={(e) => handleSOPChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select SOP...</option>
                      {MOCK_SOPS.map(sop => (
                        <option key={sop.id} value={sop.id}>
                          {sop.name} (v{sop.version})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select an assignee...</option>
                  <option value="Dr. Sarah Chen">Dr. Sarah Chen</option>
                  <option value="Dr. Mike Johnson">Dr. Mike Johnson</option>
                  <option value="Dr. Emily Taylor">Dr. Emily Taylor</option>
                  <option value="Dr. James Wilson">Dr. James Wilson</option>
                </select>
              </div>

              {/* Test Instructions */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Test Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter general test description..."
                  />
                </div>
                
                {/* Test Steps Section */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-700">Test Steps</h3>
                    {!selectedSOP && (
                      <button
                        onClick={() => setShowAddStepForm(true)}
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Step
                      </button>
                    )}
                  </div>
                  
                  {selectedSOP ? (
                    <div className="space-y-4">
                      {editedSOPSteps.map((step, stepIndex) => (
                        <div key={stepIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-sm font-medium text-gray-900">{step.name}</h4>
                            <button
                              onClick={() => addInstructionToStep(stepIndex)}
                              className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                            >
                              <Plus className="w-3 h-3 mr-1" />
                              Add Instruction
                            </button>
                          </div>
                          <div className="space-y-2 mt-2">
                            {step.instructions.map((instruction, instructionIndex) => (
                              <div key={instructionIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={instruction}
                                  onChange={(e) => updateStepInstruction(stepIndex, instructionIndex, e.target.value)}
                                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                  onClick={() => removeStepInstruction(stepIndex, instructionIndex)}
                                  className="text-red-500 hover:text-red-700"
                                  disabled={step.instructions.length <= 1}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      <p className="text-xs text-gray-500 italic">
                        These steps are based on the selected SOP. You can modify the instructions as needed.
                      </p>
                    </div>
                  ) : (
                    <div>
                      {/* Custom steps */}
                      {customSteps.length > 0 ? (
                        <div className="space-y-4">
                          {customSteps.map((step, stepIndex) => {
                            const isEditing = editingCustomStepIndex === stepIndex;
                            
                            return (
                              <div key={stepIndex} className="bg-white rounded-lg p-3 border border-gray-200">
                                {isEditing ? (
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <input
                                        type="text"
                                        value={editedCustomStep.name}
                                        onChange={(e) => setEditedCustomStep({...editedCustomStep, name: e.target.value})}
                                        className="text-sm font-medium text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent w-full"
                                        placeholder="Step name"
                                      />
                                      <button
                                        onClick={addEditedCustomStepInstruction}
                                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center"
                                      >
                                        <Plus className="w-3 h-3 mr-1" />
                                        Add Instruction
                                      </button>
                                    </div>
                                    
                                    <div className="space-y-2">
                                      {editedCustomStep.instructions.map((instruction, i) => (
                                        <div key={i} className="flex items-center space-x-2">
                                          <input
                                            type="text"
                                            value={instruction}
                                            onChange={(e) => updateEditedCustomStepInstruction(i, e.target.value)}
                                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder={`Instruction ${i + 1}`}
                                          />
                                          <button
                                            onClick={() => removeEditedCustomStepInstruction(i)}
                                            className="text-red-500 hover:text-red-700"
                                            disabled={editedCustomStep.instructions.length <= 1}
                                          >
                                            <X className="w-4 h-4" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                    
                                    <div className="flex justify-end space-x-2 pt-2">
                                      <button
                                        onClick={() => setEditingCustomStepIndex(null)}
                                        className="px-3 py-1 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                                      >
                                        Cancel
                                      </button>
                                      <button
                                        onClick={saveEditedCustomStep}
                                        className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                                      >
                                        Save
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center justify-between mb-2">
                                      <h4 className="text-sm font-medium text-gray-900">{step.name}</h4>
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => startEditingCustomStep(stepIndex)}
                                          className="text-blue-600 hover:text-blue-700"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                          onClick={() => deleteCustomStep(stepIndex)}
                                          className="text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>
                                    <ol className="list-decimal list-inside space-y-1">
                                      {step.instructions.map((instruction, i) => (
                                        <li key={i} className="text-sm text-gray-600">{instruction}</li>
                                      ))}
                                    </ol>
                                  </>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-sm text-gray-500">No steps defined yet. Add steps or select an SOP.</p>
                        </div>
                      )}
                      
                      {/* Add Step Form */}
                      {showAddStepForm && (
                        <div className="mt-4 bg-blue-50 rounded-lg p-4 border border-blue-100">
                          <h4 className="text-sm font-medium text-blue-800 mb-3">Add New Step</h4>
                          <div className="space-y-3">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Step Name
                              </label>
                              <input
                                type="text"
                                value={newStep.name}
                                onChange={(e) => setNewStep({ ...newStep, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="e.g., Sample Preparation"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Instructions
                              </label>
                              <div className="space-y-2">
                                {newStep.instructions.map((instruction, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <input
                                      type="text"
                                      value={instruction}
                                      onChange={(e) => updateNewStepInstruction(index, e.target.value)}
                                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                      placeholder={`Instruction ${index + 1}`}
                                    />
                                    <button
                                      onClick={() => removeNewStepInstruction(index)}
                                      className="text-red-500 hover:text-red-700"
                                      disabled={newStep.instructions.length <= 1}
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                ))}
                                <button
                                  onClick={addNewStepInstruction}
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
                                  setNewStep({ name: '', instructions: [''] });
                                  setShowAddStepForm(false);
                                }}
                                className="px-3 py-1 text-sm font-medium text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={addCustomStep}
                                className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                              >
                                Add Step
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            {/* Resource Selection */}
            <div className="grid grid-cols-2 gap-6 mt-6">
              {/* Equipment Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Required Equipment</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <Listbox
                      value={formData.selectedEquipment}
                      onChange={(selected) => setFormData(prev => ({ ...prev, selectedEquipment: selected }))}
                      multiple
                    >
                      <div className="relative">
                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm">
                          <span className="block truncate">
                            {formData.selectedEquipment.length === 0 
                              ? 'Select equipment...' 
                              : `${formData.selectedEquipment.length} selected`}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={React.Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            <div className="px-3 py-2">
                              <div className="relative">
                                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                  type="text"
                                  value={searchQueries.equipment}
                                  onChange={(e) => setSearchQueries(prev => ({ ...prev, equipment: e.target.value }))}
                                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Search equipment..."
                                />
                              </div>
                            </div>
                            {filteredEquipment.map((item) => (
                              <Listbox.Option
                                key={item.id}
                                value={item.id}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                  }`
                                }
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                      {item.name}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                        <Check className="h-4 w-4" />
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
                  </div>
                  
                  {/* Selected Equipment List */}
                  {formData.selectedEquipment.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-xs font-medium text-gray-500 mb-2">Selected Equipment:</h4>
                      <div className="space-y-1">
                        {formData.selectedEquipment.map(equipId => {
                          const item = equipment.find(e => e.id === equipId);
                          return (
                            <div key={equipId} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded-md">
                              <span className="text-sm text-gray-700">{item?.name}</span>
                              <button
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  selectedEquipment: prev.selectedEquipment.filter(id => id !== equipId)
                                }))}
                                className="text-gray-400 hover:text-gray-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Inventory Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Required Inventory</h3>
                <div className="space-y-3">
                  <div className="relative">
                    <Listbox
                      value={formData.selectedInventory}
                      onChange={(selected) => setFormData(prev => ({ ...prev, selectedInventory: selected }))}
                      multiple
                    >
                      <div className="relative">
                        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm">
                          <span className="block truncate">
                            {formData.selectedInventory.length === 0 
                              ? 'Select inventory...' 
                              : `${formData.selectedInventory.length} selected`}
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronDown className="h-5 w-5 text-gray-400" />
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={React.Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            <div className="px-3 py-2">
                              <div className="relative">
                                <Search className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                                <input
                                  type="text"
                                  value={searchQueries.inventory}
                                  onChange={(e) => setSearchQueries(prev => ({ ...prev, inventory: e.target.value }))}
                                  className="w-full pl-9 pr-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                  placeholder="Search inventory..."
                                />
                              </div>
                            </div>
                            {filteredInventory.map((item) => (
                              <Listbox.Option
                                key={item.id}
                                value={item.id}
                                className={({ active }) =>
                                  `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                    active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                                  }`
                                }
                              >
                                {({ selected }) => (
                                  <>
                                    <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                                      {item.name}
                                    </span>
                                    {selected ? (
                                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600">
                                        <Check className="h-4 w-4" />
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
                  </div>
                  
                  {/* Selected Inventory List */}
                  {formData.selectedInventory.length > 0 && (
                    <div className="mt-2">
                      <h4 className="text-xs font-medium text-gray-500 mb-2">Selected Inventory:</h4>
                      <div className="space-y-1">
                        {formData.selectedInventory.map(itemId => {
                          const item = items.find(i => i.id === itemId);
                          return (
                            <div key={itemId} className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded-md">
                              <span className="text-sm text-gray-700">{item?.name}</span>
                              <button
                                onClick={() => setFormData(prev => ({
                                  ...prev,
                                  selectedInventory: prev.selectedInventory.filter(id => id !== itemId)
                                }))}
                                className="text-gray-400 hover:text-gray-500"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Create Test
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}