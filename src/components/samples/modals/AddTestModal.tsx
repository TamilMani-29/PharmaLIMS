import React from 'react';
import { X, Beaker } from 'lucide-react';
import { Sample, Aliquot } from '../../../context/SampleContext';

interface AddTestModalProps {
  isOpen: boolean;
  onClose: () => void;
  sample: Sample;
  selectedAliquot?: Aliquot | null;
  newTest: {
    name: string;
    method: string;
  };
  onTestChange: (test: { name: string; method: string }) => void;
  onAliquotSelect: (aliquotId: string) => void;
  onSubmit: () => void;
}

export default function AddTestModal({
  isOpen,
  onClose,
  sample,
  selectedAliquot,
  newTest,
  onTestChange,
  onAliquotSelect,
  onSubmit,
}: AddTestModalProps) {
  if (!isOpen) return null;
  if (!sample) return null; // Add early return if sample is undefined

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Add New Test
          </h3>
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
              Select Aliquot
            </label>
            <select
              value={selectedAliquot?.id || ''}
              onChange={(e) => onAliquotSelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select an aliquot...</option>
              {sample.aliquots?.map((aliquot) => ( // Add optional chaining
                <option key={aliquot.id} value={aliquot.id}>
                  {aliquot.id} - {aliquot.volume} units ({aliquot.location})
                </option>
              ))}
            </select>
          </div>

          {selectedAliquot && (
            <>
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="flex items-center text-sm text-blue-700">
                  <Beaker className="w-4 h-4 mr-2" />
                  Using Aliquot {selectedAliquot.id} ({selectedAliquot.volume} units)
                </div>
              </div>
              
              <TestDetailsForm
                newTest={newTest}
                onTestChange={onTestChange}
              />
            </>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!selectedAliquot || !newTest.name || !newTest.method}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface TestDetailsFormProps {
  newTest: {
    name: string;
    method: string;
  };
  onTestChange: (test: { name: string; method: string }) => void;
}

function TestDetailsForm({ newTest, onTestChange }: TestDetailsFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Test Name
        </label>
        <input
          type="text"
          value={newTest.name}
          onChange={(e) => onTestChange({ ...newTest, name: e.target.value })}
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
          onChange={(e) => onTestChange({ ...newTest, method: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter test method"
        />
      </div>
    </div>
  );
}