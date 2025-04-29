import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useSamples } from '../../context/SampleContext';
import { useTests } from '../../context/TestContext';
import SampleDetailsTab from './modals/tabs/SampleDetailsTab';
import TimelineTab from './modals/tabs/TimelineTab';
import NotesTab from './modals/tabs/NotesTab';
import AttachmentsTab from './modals/tabs/AttachmentsTab';
import AliquotsTab from './modals/tabs/AliquotsTab';
import TestsTab from './modals/tabs/TestsTab';
import CreateAliquotModal from './modals/CreateAliquotModal';

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

export default function SampleDetails() {
  const { sampleId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { samples, updateSample, addAliquot, addTest } = useSamples();
  const { tests: allTests } = useTests();
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'notes' | 'attachments' | 'aliquots' | 'tests'>('details');
  const [isEditingMetadata, setIsEditingMetadata] = useState(false);
  const [isEditingStatus, setIsEditingStatus] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedOwner, setSelectedOwner] = useState('');
  const [isCreatingAliquot, setIsCreatingAliquot] = useState(false);
  const [newAliquotVolume, setNewAliquotVolume] = useState(1);
  const [selectedAliquotBoxId, setSelectedAliquotBoxId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedAliquotId, setSelectedAliquotId] = useState<string | null>(null);

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

  const sample = samples.find(s => s.id === sampleId);
  if (!sample) return null;

  // Handler for navigating to test details
  const handleTestClick = (testId: string) => {
    const productId = location.pathname.split('/')[2];
    navigate(`/products/${productId}/tests/${testId}`);
  };

  const selectedAliquot = selectedAliquotId ? sample.aliquots.find(a => a.id === selectedAliquotId) : null;

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => {
              // Extract productId from the current path
              const productId = location.pathname.split('/')[2];
              navigate(`/products/${productId}`);
            }}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              Sample Details
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {sample.id} - {sample.type}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-2">
            <TabButton tab="details" label="Details" />
            <TabButton tab="aliquots" label="Aliquots" />
            <TabButton tab="tests" label="Tests" />
            <TabButton tab="timeline" label="Timeline" />
            <TabButton tab="notes" label="Notes" />
            <TabButton tab="attachments" label="Attachments" />
          </div>
        </div>

        <div className="p-6">
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
              onStatusChange={(status) => {
                setSelectedStatus(status);
                updateSample(sample.id, { status });
              }}
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
              onSaveStatus={() => setIsEditingStatus(false)}
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
              onAliquotClick={(sampleId, aliquotId) => {
                setSelectedAliquotId(aliquotId);
                setActiveTab('tests');
              }}
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
      <CreateAliquotModal
        isOpen={isCreatingAliquot}
        onClose={() => setIsCreatingAliquot(false)}
        volumeLeft={sample.volumeLeft}
        newAliquotVolume={newAliquotVolume}
        onVolumeChange={setNewAliquotVolume}
        selectedBoxId={selectedAliquotBoxId}
        onBoxChange={setSelectedAliquotBoxId}
        boxLocations={boxLocations}
        onCreateAliquot={() => {
          if (selectedAliquotBoxId && newAliquotVolume > 0 && newAliquotVolume <= sample.volumeLeft) {
            addAliquot(sample.id, {
              id: `ALQ-${String(sample.aliquots.length + 1).padStart(3, '0')}`,
              volume: newAliquotVolume,
              createdAt: new Date().toISOString().split('T').join(' ').slice(0, 16),
              location: boxLocations[selectedAliquotBoxId].lab,
              tests: []
            });
            setIsCreatingAliquot(false);
            setSelectedAliquotBoxId('');
            setNewAliquotVolume(1);
          }
        }}
      />
    </div>
  );
}