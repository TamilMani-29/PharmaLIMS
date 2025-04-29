import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Sample } from '../../../context/SampleContext';

interface Equipment {
  id: string;
  name: string;
  type: string;
}

interface Analyst {
  id: string;
  name: string;
}

interface TestStep {
  id: string;
  sampleId: string;
  aliquotId: string;
  testId: string;
  stepName: string;
  equipmentId: string;
  analystId: string;
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
}

interface TestStepDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  step: TestStep | null;
  onUpdate: (step: TestStep) => void;
  onDelete: (stepId: string) => void;
  equipment: Equipment[];
  analysts: Analyst[];
  samples: Sample[];
}

export default function TestStepDetailsModal({
  isOpen,
  onClose,
  step,
  onUpdate,
  onDelete,
  equipment,
  analysts,
  samples,
}: TestStepDetailsModalProps) {
  const [formData, setFormData] = useState<TestStep | null>(null);
  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [selectedAliquot, setSelectedAliquot] = useState<any | null>(null);
  const [selectedTest, setSelectedTest] = useState<any | null>(null);
  const [overlaps, setOverlaps] = useState<TestStep[]>([]);

  useEffect(() => {
    if (step) {
      // Convert UTC ISO string to local datetime-local input value
      const startDate = new Date(step.startTime);
      const endDate = new Date(step.endTime);
      
      setFormData({
        ...step,
        startTime: startDate.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T'),
        endTime: endDate.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T')
      });
      
      const sample = samples.find(s => s.id === step.sampleId);
      setSelectedSample(sample || null);
      
      if (sample) {
        const aliquot = sample.aliquots.find(a => a.id === step.aliquotId);
        setSelectedAliquot(aliquot || null);
        
        if (aliquot) {
          const test = aliquot.tests.find(t => t.id === step.testId);
          setSelectedTest(test || null);
        }
      }
    }
  }, [step, samples]);

  if (!isOpen || !step || !formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      // Convert local datetime to UTC ISO string
      const updatedStep = {
        ...formData,
        startTime: new Date(formData.startTime).toISOString(),
        endTime: new Date(formData.endTime).toISOString()
      };
      onUpdate(updatedStep);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Test Step Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sample Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Sample Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-xs text-gray-500">Sample ID</label>
                <span className="text-sm font-medium">{selectedSample?.id}</span>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Aliquot ID</label>
                <span className="text-sm font-medium">{selectedAliquot?.id}</span>
              </div>
              <div>
                <label className="block text-xs text-gray-500">Test Name</label>
                <span className="text-sm font-medium">{selectedTest?.name}</span>
              </div>
            </div>
          </div>

          {/* Step Details */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Step Name
              </label>
              <input
                type="text"
                value={formData.stepName}
                onChange={(e) => setFormData(prev => prev ? { ...prev, stepName: e.target.value } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment
                </label>
                <select
                  value={formData.equipmentId}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, equipmentId: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select equipment...</option>
                  {equipment.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Analyst
                </label>
                <select
                  value={formData.analystId}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, analystId: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select analyst...</option>
                  {analysts.map(analyst => (
                    <option key={analyst.id} value={analyst.id}>
                      {analyst.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                {/* Use datetime-local input with proper value format */}
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, startTime: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  step="60" // 1 minute step
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                {/* Use datetime-local input with proper value format */}
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => prev ? { ...prev, endTime: e.target.value } : null)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  step="60" // 1 minute step
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => prev ? { ...prev, status: e.target.value as TestStep['status'] } : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {overlaps.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2" />
                <div>
                  <h4 className="text-sm font-medium text-red-800">Resource Conflicts Detected</h4>
                  <ul className="mt-2 text-sm text-red-700">
                    {overlaps.map(overlap => (
                      <li key={overlap.id}>
                        Conflicts with {overlap.stepName} ({new Date(overlap.startTime).toLocaleTimeString()} - {new Date(overlap.endTime).toLocaleTimeString()})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between pt-6">
            <button
              type="button"
              onClick={() => {
                if (step) {
                  onDelete(step.id);
                }
              }}
              className="px-4 py-2 text-red-600 hover:text-red-700 font-medium"
            >
              Delete Step
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}