import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useSamples } from '../../../context/SampleContext';

interface SampleRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SampleRegistrationModal({
  isOpen,
  onClose,
}: SampleRegistrationModalProps) {
  const { samples, addSample } = useSamples();
  
  const [selectedBoxId, setSelectedBoxId] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    collectionDate: '',
    owner: '',
    boxId: '',
    volume: '',
    notes: ''
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
  
  const handleBoxChange = (boxId: string) => {
    setSelectedBoxId(boxId);
    setFormData(prev => ({ ...prev, boxId }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newSample: Sample = {
      id: `SAM-${String(samples.length + 1).padStart(3, '0')}`,
      name: formData.name,
      type: formData.type,
      submissionDate: new Date().toISOString().split('T')[0],
      status: 'submitted',
      owner: formData.owner,
      boxId: formData.boxId,
      location: formData.boxId ? boxLocations[formData.boxId as keyof typeof boxLocations].lab : '',
      lastMovement: new Date().toISOString().split('T').join(' ').slice(0, 16),
      volumeLeft: parseFloat(formData.volume),
      totalVolume: Number(formData.volume),
      aliquotsCreated: 0,
      aliquots: []
    };

    addSample(newSample);
    
    // Reset form
    setFormData({
      name: '',
      type: '',
      collectionDate: '',
      owner: '',
      boxId: '',
      volume: '',
      notes: ''
    });
    setSelectedBoxId('');
    
    // Close modal
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Register New Sample</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
          <form id="sampleRegistrationForm" onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              {/* Sample Type */}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sample Name
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter sample name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sample Type
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  required
                >
                  <option value="">Select type...</option>
                  <option value="blood">Blood</option>
                  <option value="tissue">Tissue</option>
                  <option value="urine">Urine</option>
                </select>
              </div>

              {/* Collection Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Collection Date
                </label>
                <input
                  type="date"
                  value={formData.collectionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, collectionDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* Owner/Analyst */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Owner/Analyst
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.owner}
                  onChange={(e) => setFormData(prev => ({ ...prev, owner: e.target.value }))}
                  required
                >
                  <option value="">Select owner...</option>
                  <option value="john">John Doe</option>
                  <option value="jane">Jane Smith</option>
                </select>
              </div>

              {/* Box ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Box ID
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={selectedBoxId}
                  onChange={(e) => {
                    handleBoxChange(e.target.value);
                    setFormData(prev => ({ ...prev, boxId: e.target.value }));
                  }}
                  required
                >
                  <option value="">Select box...</option>
                  <option value="box1">Box A1</option>
                  <option value="box2">Box A2</option>
                </select>
              </div>
            </div>

            {/* Storage Location Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Storage Location Details
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Drawer
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {selectedBoxId ? boxLocations[selectedBoxId as keyof typeof boxLocations].drawer : '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Rack
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {selectedBoxId ? boxLocations[selectedBoxId as keyof typeof boxLocations].rack : '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Shelf
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {selectedBoxId ? boxLocations[selectedBoxId as keyof typeof boxLocations].shelf : '-'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Freezer
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {selectedBoxId ? boxLocations[selectedBoxId as keyof typeof boxLocations].freezer : '-'}
                  </div>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm text-gray-600 mb-1">
                    Lab Location
                  </label>
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
                    {selectedBoxId ? boxLocations[selectedBoxId as keyof typeof boxLocations].lab : '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Volume Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Volume Details
              </h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Total Volume
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.volume}
                    onChange={(e) => setFormData(prev => ({ ...prev, volume: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter volume"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes..."
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Attachments
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                    aria-hidden="true"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input
                        type="file"
                        className="sr-only"
                        multiple
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, PNG, JPG up to 10MB
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="flex items-center justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 mr-3"
            type="button"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            type="button"
          >
            Register Sample
          </button>
        </div>
      </div>
    </div>
  );
}