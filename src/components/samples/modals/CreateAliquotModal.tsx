import React from 'react';
import { X } from 'lucide-react';
import { BoxLocation } from '../../../types/sample';

interface CreateAliquotModalProps {
  isOpen: boolean;
  onClose: () => void;
  volumeLeft: number;
  newAliquotVolume: number;
  onVolumeChange: (volume: number) => void;
  selectedBoxId: string;
  onBoxChange: (boxId: string) => void;
  boxLocations: Record<string, BoxLocation>;
  onCreateAliquot: () => void;
}

export default function CreateAliquotModal({
  isOpen,
  onClose,
  volumeLeft,
  newAliquotVolume,
  onVolumeChange,
  selectedBoxId,
  onBoxChange,
  boxLocations,
  onCreateAliquot,
}: CreateAliquotModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Create New Aliquot</h3>
          <button
            onClick={onClose}
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
              max={volumeLeft}
              value={newAliquotVolume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-1 text-sm text-gray-500">
              Available volume: {volumeLeft} units
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Storage Box
            </label>
            <select
              value={selectedBoxId}
              onChange={(e) => onBoxChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a storage box...</option>
              <option value="box1">Box A1</option>
              <option value="box2">Box A2</option>
            </select>
          </div>
          
          {selectedBoxId && (
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Box Location</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Lab:</span>
                  <span className="ml-2 text-gray-900">{boxLocations[selectedBoxId].lab}</span>
                </div>
                <div>
                  <span className="text-gray-500">Freezer:</span>
                  <span className="ml-2 text-gray-900">{boxLocations[selectedBoxId].freezer}</span>
                </div>
                <div>
                  <span className="text-gray-500">Rack:</span>
                  <span className="ml-2 text-gray-900">{boxLocations[selectedBoxId].rack}</span>
                </div>
                <div>
                  <span className="text-gray-500">Shelf:</span>
                  <span className="ml-2 text-gray-900">{boxLocations[selectedBoxId].shelf}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onCreateAliquot}
            disabled={!selectedBoxId || newAliquotVolume <= 0 || newAliquotVolume > volumeLeft}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Aliquot
          </button>
        </div>
      </div>
    </div>
  );
}