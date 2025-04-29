import React, { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { useSamples } from '../../../context/SampleContext';
import { useTests } from '../../../context/TestContext';

interface AddSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  testId: string;
}

const TEST_STEPS = [
  {
    id: 'STP-001',
    name: 'Sample Preparation',
    description: [
      'Ensure all required materials are available and at room temperature',
      'Label sample containers with unique identifiers',
      'Prepare buffer solutions according to SOP specifications',
      'Document initial sample weight and volume measurements',
      'Filter samples using 0.45μm membrane filter if required'
    ],
    status: 'Not Started'
  },
  {
    id: 'STP-002',
    name: 'pH Measurement',
    description: [
      'Calibrate pH meter using standard buffer solutions (pH 4.0, 7.0, and 10.0)',
      'Verify calibration accuracy with a check standard',
      'Rinse electrode with deionized water between measurements',
      'Measure sample pH in triplicate and record all readings',
      'Calculate average pH value and standard deviation',
      'Clean and store electrode according to manufacturer guidelines'
    ],
    status: 'Not Started'
  }
];

export default function AddSampleModal({ isOpen, onClose, testId }: AddSampleModalProps) {
  const { samples } = useSamples();
  const { tests, addSampleToTest } = useTests();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSamples, setSelectedSamples] = useState<string[]>([]);

  if (!isOpen) return null;

  const test = tests.find(t => t.id === testId);
  if (!test) return null;

  // Filter out samples that are already in the test
  const availableSamples = samples.filter(sample => 
    !test.samples.some(s => s.sampleId === sample.id) &&
    (sample.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     sample.id.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddSamples = () => {
    selectedSamples.forEach(sampleId => {
      const sample = samples.find(s => s.id === sampleId);
      if (sample) {
        addSampleToTest(testId, {
          sampleId: sample.id,
          sampleName: sample.name,
          status: 'Not Started',
          steps: TEST_STEPS
        });
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Samples to Test</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search samples..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Selected Samples */}
          {selectedSamples.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Samples</h3>
              <div className="space-y-2">
                {selectedSamples.map(sampleId => {
                  const sample = samples.find(s => s.id === sampleId);
                  return (
                    <div
                      key={sampleId}
                      className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                    >
                      <div>
                        <span className="text-sm font-medium text-gray-900">{sample?.name}</span>
                        <span className="text-sm text-gray-500 ml-2">({sampleId})</span>
                      </div>
                      <button
                        onClick={() => setSelectedSamples(prev => prev.filter(id => id !== sampleId))}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Available Samples */}
          <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
            {availableSamples.map(sample => (
              <div
                key={sample.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedSamples(prev => [...prev, sample.id])}
              >
                <div>
                  <span className="text-sm font-medium text-gray-900">{sample.name}</span>
                  <span className="text-sm text-gray-500 ml-2">({sample.id})</span>
                </div>
                <Plus className="w-4 h-4 text-gray-400" />
              </div>
            ))}
            {availableSamples.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-500">
                No samples available
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 mr-3"
          >
            Cancel
          </button>
          <button
            onClick={handleAddSamples}
            disabled={selectedSamples.length === 0}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Selected Samples
          </button>
        </div>
      </div>
    </div>
  );
}