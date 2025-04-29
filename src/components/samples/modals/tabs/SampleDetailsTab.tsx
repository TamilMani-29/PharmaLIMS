import React from 'react';
import { Edit2, CheckCircle2, ChevronRight } from 'lucide-react';
import { Sample } from '../../../../context/SampleContext';

interface SampleDetailsTabProps {
  sample: Sample;
  isEditingMetadata: boolean;
  isEditingStatus: boolean;
  isEditingLocation: boolean;
  selectedType: string;
  selectedOwner: string;
  selectedStatus: string;
  selectedLocation: string;
  onEditMetadata: () => void;
  onEditStatus: () => void;
  onEditLocation: () => void;
  onTypeChange: (value: string) => void;
  onOwnerChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSaveMetadata: () => void;
  onSaveStatus: () => void;
  onSaveLocation: () => void;
}

const SAMPLE_STAGES = [
  {
    id: 'submitted',
    name: 'Sample Submitted',
    description: 'Sample has been registered in the system'
  },
  {
    id: 'aliquots_created',
    name: 'Aliquots Created',
    description: 'Sample has been divided into aliquots'
  },
  {
    id: 'aliquots_plated',
    name: 'Aliquots Plated',
    description: 'Aliquots have been plated for testing'
  },
  {
    id: 'testing_completed',
    name: 'Testing Completed',
    description: 'All tests have been completed'
  },
  {
    id: 'in_storage',
    name: 'In Storage',
    description: 'Sample has been archived in storage'
  }
];

const LAB_LOCATIONS = [
  'Lab 1',
  'Lab 2',
  'Lab 3',
  'Lab 4',
  'Lab 5',
];

export default function SampleDetailsTab({
  sample,
  isEditingMetadata,
  isEditingStatus,
  isEditingLocation,
  selectedType,
  selectedOwner,
  selectedStatus,
  selectedLocation,
  onEditMetadata,
  onEditStatus,
  onEditLocation,
  onTypeChange,
  onOwnerChange,
  onStatusChange,
  onLocationChange,
  onSaveMetadata,
  onSaveStatus,
  onSaveLocation,
}: SampleDetailsTabProps) {
  return (
    <div className="space-y-6">
      {/* Sample Metadata */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">
            Sample Information
          </h3>
          <button
            onClick={onEditMetadata}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            {isEditingMetadata ? 'Cancel' : 'Edit'}
          </button>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Sample Type
            </label>
            {isEditingMetadata ? (
              <select
                value={selectedType || sample.type}
                onChange={(e) => onTypeChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SAMPLE_STAGES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            ) : (
              <span className="text-sm font-medium">
                {sample.type}
              </span>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Submission Date
            </label>
            <span className="text-sm font-medium">
              {sample.submissionDate}
            </span>
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">
              Owner
            </label>
            {isEditingMetadata ? (
              <select
                value={selectedOwner || sample.owner}
                onChange={(e) => onOwnerChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SAMPLE_STAGES.map(owner => (
                  <option key={owner} value={owner}>{owner}</option>
                ))}
              </select>
            ) : (
              <span className="text-sm font-medium">
                {sample.owner}
              </span>
            )}
          </div>
        </div>
        {isEditingMetadata && (
          <div className="flex justify-end mt-4">
            <button
              onClick={onSaveMetadata}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Status Update */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-medium text-gray-900">
            Sample Progress
          </h3>
        </div>
        
        <div className="relative mt-8">
          {/* Progress Bar */}
          <div className="absolute top-4 left-0 right-0 h-1 bg-gray-200">
            <div 
              className="h-full bg-green-500 transition-all duration-300"
              style={{ 
                width: `${(SAMPLE_STAGES.findIndex(s => s.id === sample.status) + 1) * (100 / SAMPLE_STAGES.length)}%` 
              }}
            />
          </div>

          {/* Stages */}
          <div className="relative flex justify-between">
            {SAMPLE_STAGES.map((stage, index) => {
            const isCompleted = SAMPLE_STAGES.findIndex(s => s.id === sample.status) >= index;
            const isCurrent = stage.id === sample.status;

            return (
              <div
                key={stage.id}
                className="flex flex-col items-center relative"
                style={{ width: '20%' }}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    isCompleted 
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  {isCompleted && <CheckCircle2 className="w-5 h-5" />}
                </div>
                <span className={`mt-2 text-sm font-medium ${
                  isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stage.name}
                </span>
              </div>
            );
          })}
          </div>

          {/* Complete Button */}
          {sample.status !== 'in_storage' && (
            <div className="flex justify-end mt-8">
              <button
                onClick={async () => {
                  const currentIndex = SAMPLE_STAGES.findIndex(s => s.id === sample.status);
                  const nextStage = SAMPLE_STAGES[currentIndex + 1];
                  if (nextStage) {
                    await onStatusChange(nextStage.id);
                    await onSaveStatus();
                  }
                }}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center"
              >
                Mark Stage as Complete
                <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Volume Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <h3 className="text-sm font-medium text-gray-700">
            Volume Information
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-xs text-gray-500">
              Total Volume
            </label>
            <span className="text-sm font-medium">
              {sample.totalVolume} units
            </span>
          </div>
          <div>
            <label className="block text-xs text-gray-500">
              Aliquots Created
            </label>
            <span className="text-sm font-medium">
              {sample.aliquotsCreated}
            </span>
          </div>
          <div>
            <label className="block text-xs text-gray-500">
              Volume Left
            </label>
            <span className="text-sm font-medium">
              {sample.volumeLeft} units
            </span>
          </div>
        </div>
      </div>

      {/* Storage Information */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-gray-700">
            Storage Location
          </h3>
          <button
            onClick={onEditLocation}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            {isEditingLocation ? 'Cancel' : 'Update Location'}
          </button>
        </div>
        <div className={`grid grid-cols-5 gap-4 ${isEditingLocation ? 'opacity-50' : ''}`}>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <label className="block text-xs text-gray-500 mb-1">Lab</label>
            <span className="text-sm font-medium text-gray-900">
              {sample.location}
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <label className="block text-xs text-gray-500 mb-1">Freezer</label>
            <span className="text-sm font-medium text-gray-900">
              F1
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <label className="block text-xs text-gray-500 mb-1">Rack</label>
            <span className="text-sm font-medium text-gray-900">
              R1
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <label className="block text-xs text-gray-500 mb-1">Shelf</label>
            <span className="text-sm font-medium text-gray-900">
              S1
            </span>
          </div>
          <div className="bg-white rounded-lg p-3 border border-gray-200">
            <label className="block text-xs text-gray-500 mb-1">Drawer</label>
            <span className="text-sm font-medium text-gray-900">
              D1
            </span>
          </div>
        </div>
        {isEditingLocation && (
          <div className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Box ID
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Select box...</option>
                  <option value="box1">Box A1</option>
                  <option value="box2">Box A2</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-700 mb-1">
                  Lab Location
                </label>
                <select
                  value={selectedLocation || sample.location}
                  onChange={(e) => onLocationChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select lab...</option>
                  {LAB_LOCATIONS.map((lab) => (
                    <option key={lab} value={lab}>{lab}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={onSaveLocation}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Update Location
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}