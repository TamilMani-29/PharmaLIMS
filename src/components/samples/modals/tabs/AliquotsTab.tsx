import React from 'react';
import { Plus, Beaker } from 'lucide-react';
import { Sample, Aliquot } from '../../../../context/SampleContext';

interface AliquotsTabProps {
  sample: Sample;
  onCreateAliquot: () => void;
  onAliquotClick: (sampleId: string, aliquotId: string) => void;
}

export default function AliquotsTab({
  sample,
  onCreateAliquot,
  onAliquotClick,
}: AliquotsTabProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Sample Aliquots</h3>
        <button
          onClick={onCreateAliquot}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center"
          disabled={sample.volumeLeft === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Aliquot
        </button>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4 text-sm font-medium text-gray-500">
            <div>Aliquot ID</div>
            <div>Volume</div>
            <div>Location</div>
            <div>Created At</div>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {sample.aliquots.map((aliquot) => (
            <div
              key={aliquot.id}
              className="px-4 py-3 grid grid-cols-4 gap-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => onAliquotClick(sample.id, aliquot.id)}
            >
              <div className="flex items-center">
                <Beaker className="w-4 h-4 text-gray-400 mr-2" />
                <span className="text-sm font-medium text-gray-900">{aliquot.id}</span>
              </div>
              <div className="text-sm text-gray-500">
                {aliquot.volume} units
              </div>
              <div className="text-sm text-gray-500">
                {aliquot.location}
              </div>
              <div className="text-sm text-gray-500">
                {aliquot.createdAt}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {sample.aliquots.length === 0 && (
        <div className="text-center py-12">
          <Beaker className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Aliquots Created</h3>
          <p className="text-gray-500">
            Create your first aliquot by clicking the button above.
          </p>
        </div>
      )}
    </div>
  );
}