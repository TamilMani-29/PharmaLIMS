import React, { useState } from 'react';
import { useSamples, Test } from '../../../context/SampleContext';
import { X, Beaker } from 'lucide-react';
import SampleDetailsTab from './tabs/SampleDetailsTab';
import TimelineTab from './tabs/TimelineTab';
import NotesTab from './tabs/NotesTab';
import AttachmentsTab from './tabs/AttachmentsTab';
import AliquotsTab from './tabs/AliquotsTab';
import TestsTab from './tabs/TestsTab';
import TestsTab from './tabs/TestsTab';

const SAMPLE_STAGES = [
  'Registered',
  'In Processing',
  'In Testing',
  'Analysis Complete',
  'Archived'
];

const LAB_LOCATIONS = [
  'Lab 1',
  'Lab 2',
  'Lab 3',
  'Lab 4',
  'Lab 5',
];

// Mock data for timeline, notes, and attachments
const mockSampleData = {
  timeline: [
    {
      event: 'Sample registered',
      date: '2025-01-15 09:00',
      user: 'John Doe'
    },
    {
      event: 'Processing started',
      date: '2025-01-15 10:30',
      user: 'Jane Smith'
    },
    {
      event: 'Moved to Testing',
      date: '2025-01-16 14:15',
      user: 'Mike Johnson'
    }
  ],
  notes: [
    {
      id: '1',
      user: 'John Doe',
      date: '2025-01-15 09:00',
      content: 'Sample received in good condition'
    },
    {
      id: '2',
      user: 'Jane Smith',
      date: '2025-01-15 10:30',
      content: 'Initial processing completed, ready for analysis'
    }
  ],
  attachments: [
    {
      id: '1',
      name: 'sample_report.pdf',
      size: '2.4 MB',
      date: '2025-01-15 09:00'
    },
    {
      id: '2',
      name: 'analysis_results.xlsx',
      size: '1.8 MB',
      date: '2025-01-16 14:15'
    }
  ]
};

interface SampleDetailModalProps {
  isOpen: boolean;
  sampleId: string | null;
  aliquotId?: string | null;
  onClose: () => void;
  onSampleClick?: (sampleId: string, aliquotId: string) => void; // Made optional with ?
}

export default function SampleDetailModal({
  isOpen,
  sampleId,
  aliquotId,
  onClose,
  onSampleClick = () => {}, // Provide default empty function
}: SampleDetailModalProps) {
  const { samples, updateSample, addAliquot, addTest } = useSamples();
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'notes' | 'attachments' | 'aliquots' | 'tests'>('details');
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isCreatingAliquot, setIsCreatingAliquot] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [newAliquotVolume, setNewAliquotVolume] = useState(1);
  const [selectedAliquotBoxId, setSelectedAliquotBoxId] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [isAddingTest, setIsAddingTest] = useState(false);
  const [newTest, setNewTest] = useState({
    name: '',
    method: '',
    assignedTo: ''
  });

  const boxLocations = {
    'box1': {
      drawer: 'D1',
      rack: 'R1',
      shelf: 'S1',
      freezer: 'F1',
      lab: 'Lab 1'
    },
    'box2': {
      drawer: 'D2',
      rack: 'R2',
      shelf: 'S2',
      freezer: 'F2',
      lab: 'Lab 2'
    }
  };

  if (!isOpen || !sampleId) return null;

  const sample = samples.find(s => s.id === sampleId);
  if (!sample) return null;

  const selectedAliquot = aliquotId ? sample.aliquots.find(a => a.id === aliquotId) : null;

  const TabButton = ({ tab, label }: { tab: 'details' | 'timeline' | 'notes' | 'attachments' | 'aliquots' | 'tests'; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-lg ${
        activeTab === tab
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );

  // Handler function to safely call onSampleClick
  const handleAliquotClick = (sampleId: string, aliquotId: string) => {
    if (onSampleClick) {
      onSampleClick(sampleId, aliquotId);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Sample Details
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {sample.id} - {sample.type}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <div className="flex space-x-2">
            <TabButton tab="details" label="Details" />
            <TabButton tab="aliquots" label="Aliquots" />
            <TabButton tab="tests" label="Tests" />
            <TabButton tab="timeline" label="Timeline" />
            <TabButton tab="notes" label="Notes" />
            <TabButton tab="attachments" label="Attachments" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <SampleDetailsTab
              sample={sample}
              isEditingMetadata={isEditingMetadata}
              isEditingStatus={isEditingStatus}
              isEditingLocation={isEditingLocation}
              selectedType={selectedType}
              selectedOwner={selectedOwner}
              selectedStatus={selectedStatus}
              selectedLocation={selectedLocation}
              onEditMetadata={() => setIsEditingMetadata(!isEditingMetadata)}
              onEditStatus={() => setIsEditingStatus(!isEditingStatus)}
              onEditLocation={() => setIsEditingLocation(!isEditingLocation)}
              onTypeChange={setSelectedType}
              onOwnerChange={setSelectedOwner}
              onStatusChange={setSelectedStatus}
              onLocationChange={setSelectedLocation}
              onSaveMetadata={() => {
                if (selectedType || selectedOwner) {
                  updateSample(sample.id, {
                    type: selectedType || sample.type,
                    owner: selectedOwner || sample.owner,
                  });
                }
                setIsEditingMetadata(false);
              }}
              onSaveStatus={() => {
                if (selectedStatus) {
                  updateSample(sample.id, { status: selectedStatus });
                }
                setIsEditingStatus(false);
              }}
              onSaveLocation={() => {
                if (selectedLocation) {
                  updateSample(sample.id, {
                    location: selectedLocation,
                    lastMovement: new Date().toISOString().split('T').join(' ').slice(0, 16),
                  });
                }
                setIsEditingLocation(false);
              }}
            />
          )}

          {activeTab === 'timeline' && (
            <TimelineTab events={mockSampleData.timeline} />
          )}

          {activeTab === 'notes' && (
            <NotesTab
              notes={mockSampleData.notes}
              onAddNote={(content) => {
                // Handle adding new note
                console.log('Adding note:', content);
              }}
            />
          )}

          {activeTab === 'attachments' && (
            <AttachmentsTab
              attachments={mockSampleData.attachments}
              onUpload={(files) => {
                // Handle file upload
                console.log('Uploading files:', files);
              }}
              onDownload={(fileId) => {
                // Handle file download
                console.log('Downloading file:', fileId);
              }}
            />
          )}
          
          {activeTab === 'aliquots' && (
            <AliquotsTab
              sample={sample}
              onCreateAliquot={() => setIsCreatingAliquot(true)}
              onAliquotClick={handleAliquotClick}
            />
          )}

          {activeTab === 'tests' && (
            <TestsTab
              sample={sample}
              selectedAliquot={selectedAliquot} 
              onCreateAliquot={() => setIsCreatingAliquot(true)} 
              disabled={false}
            />
          )}
        </div>
      </div>

      {/* Create Aliquot Modal */}

      {/* Add Test Modal */}
      {isAddingTest && selectedAliquot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Test for Aliquot {selectedAliquot.id}
              </h3>
              <button
                onClick={() => setIsAddingTest(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="bg-blue-50 rounded-lg p-3 mb-6">
                <div className="flex items-center text-sm text-blue-700">
                  <Beaker className="w-4 h-4 mr-2" />
                  Using Aliquot {selectedAliquot.id} ({selectedAliquot.volume} units)
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Name
                </label>
                <input
                  type="text"
                  value={newTest.name}
                  onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter test name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Method
                </label>
                <input
                  type="text"
                  value={newTest.method}
                  onChange={(e) => setNewTest({ ...newTest, method: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter test method"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigned To
                </label>
                <input
                  type="text"
                  value={newTest.assignedTo}
                  onChange={(e) => setNewTest({ ...newTest, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter assignee name"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setIsAddingTest(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (!newTest.name || !newTest.method || !newTest.assignedTo) {
                      alert('Please fill in all fields');
                      return;
                    }
                    const test: Test = {
                      id: `TST-${String(selectedAliquot.tests.length + 1).padStart(3, '0')}`,
                      name: newTest.name,
                      method: newTest.method,
                      assignedTo: newTest.assignedTo,
                      status: 'Pending',
                      startDate: new Date().toISOString().split('T').join(' ').slice(0, 16)
                    };
                    addTest(sample.id, selectedAliquot.id, test);
                    setIsAddingTest(false);
                    setNewTest({ name: '', method: '', assignedTo: '' });
                  }}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
                >
                  Add Test
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Add Test Modal (No Aliquot Selected) */}
      {isAddingTest && !selectedAliquot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-5xl p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Add New Test
              </h3>
              <button
                onClick={() => setIsAddingTest(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              {/* Aliquot Creation Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Create New Aliquot</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Volume (units)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max={sample.volumeLeft}
                      value={newAliquotVolume}
                      onChange={(e) => setNewAliquotVolume(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="mt-1 text-sm text-gray-500">
                      Available volume: {sample.volumeLeft} units
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Storage Box
                    </label>
                    <select
                      value={selectedAliquotBoxId}
                      onChange={(e) => setSelectedAliquotBoxId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select a storage box...</option>
                      <option value="box1">Box A1</option>
                      <option value="box2">Box A2</option>
                    </select>
                  </div>
                  
                  {selectedAliquotBoxId && (
                    <div className="bg-white rounded-lg p-3 border border-gray-200 mt-4">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">Box Location</h5>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">Lab:</span>
                          <span className="ml-2 text-gray-900">{boxLocations[selectedAliquotBoxId].lab}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Freezer:</span>
                          <span className="ml-2 text-gray-900">{boxLocations[selectedAliquotBoxId].freezer}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Rack:</span>
                          <span className="ml-2 text-gray-900">{boxLocations[selectedAliquotBoxId].rack}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Shelf:</span>
                          <span className="ml-2 text-gray-900">{boxLocations[selectedAliquotBoxId].shelf}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Test Details Section */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Test Details</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Name
                    </label>
                    <input
                      type="text"
                      value={newTest.name}
                      onChange={(e) => setNewTest({ ...newTest, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter test name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Method
                    </label>
                    <input
                      type="text"
                      value={newTest.method}
                      onChange={(e) => setNewTest({ ...newTest, method: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter test method"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To
                    </label>
                    <input
                      type="text"
                      value={newTest.assignedTo}
                      onChange={(e) => setNewTest({ ...newTest, assignedTo: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter assignee name"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setIsAddingTest(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (!selectedAliquotBoxId || !newTest.name || !newTest.method || !newTest.assignedTo) {
                    alert('Please fill in all required fields');
                    return;
                  }
                  
                  // Create new aliquot
                  const newAliquot = {
                    id: `ALQ-${String(sample.aliquots.length + 1).padStart(3, '0')}`,
                    volume: newAliquotVolume,
                    createdAt: new Date().toISOString().split('T').join(' ').slice(0, 16),
                    location: boxLocations[selectedAliquotBoxId].lab,
                    tests: [],
                  };
                  
                  // Add aliquot
                  addAliquot(sample.id, newAliquot);
                  
                  // Create and add test
                  const test: Test = {
                    id: `TST-001`,
                    name: newTest.name,
                    method: newTest.method,
                    assignedTo: newTest.assignedTo,
                    status: 'Pending',
                    startDate: new Date().toISOString().split('T').join(' ').slice(0, 16)
                  };
                  
                  addTest(sample.id, newAliquot.id, test);
                  setIsAddingTest(false);
                  setNewTest({ name: '', method: '', assignedTo: '' });
                  setSelectedAliquotBoxId('');
                  setNewAliquotVolume(1);
                }}
                className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Create Aliquot & Add Test
              </button>
            </div>
          </div>
        </div>
      )}
      {isCreatingAliquot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create New Aliquot</h3>
              <button
                onClick={() => setIsCreatingAliquot(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volume (units)
                </label>
                <input
                  type="number"
                  min="1"
                  max={sample.volumeLeft}
                  value={newAliquotVolume}
                  onChange={(e) => setNewAliquotVolume(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Available volume: {sample.volumeLeft} units
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Storage Box
                </label>
                <select
                  value={selectedAliquotBoxId}
                  onChange={(e) => setSelectedAliquotBoxId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a storage box...</option>
                  <option value="box1">Box A1</option>
                  <option value="box2">Box A2</option>
                </select>
              </div>
              
              {selectedAliquotBoxId && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Box Location</h4>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Lab:</span>
                      <span className="ml-2 text-gray-900">{boxLocations[selectedAliquotBoxId].lab}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Freezer:</span>
                      <span className="ml-2 text-gray-900">{boxLocations[selectedAliquotBoxId].freezer}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Rack:</span>
                      <span className="ml-2 text-gray-900">{boxLocations[selectedAliquotBoxId].rack}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Shelf:</span>
                      <span className="ml-2 text-gray-900">{boxLocations[selectedAliquotBoxId].shelf}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsCreatingAliquot(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (selectedAliquotBoxId && newAliquotVolume > 0 && newAliquotVolume <= sample.volumeLeft) {
                    addAliquot(sample.id, {
                      volume: newAliquotVolume,
                      location: boxLocations[selectedAliquotBoxId].lab,
                      boxId: selectedAliquotBoxId,
                    });
                    setIsCreatingAliquot(false);
                  }
                }}
                disabled={!selectedAliquotBoxId || newAliquotVolume <= 0 || newAliquotVolume > sample.volumeLeft}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Aliquot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}