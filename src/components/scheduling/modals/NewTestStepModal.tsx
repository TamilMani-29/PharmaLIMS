import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Sample } from '../../../context/SampleContext';
import { hasOverlap } from '../SchedulingCalendar';
import { checkResourceAvailability } from '../SchedulingCalendar';

interface Equipment {
  id: string;
  name: string;
  type: string;
}

interface Analyst {
  id: string;
  name: string;
}

interface NewTestStepModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (step: any) => void;
  timeSlot: { start: Date; end: Date } | null;
  samples: Sample[];
  equipment: Equipment[];
  analysts: Analyst[];
  testSteps: TestStep[];
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

export default function NewTestStepModal({
  isOpen,
  onClose,
  onAdd,
  timeSlot,
  samples,
  equipment,
  analysts,
  testSteps,
}: NewTestStepModalProps) {
  const [formData, setFormData] = useState({
    sampleId: '',
    aliquotId: '',
    testId: '',
    stepName: '',
    equipmentId: '',
    analystId: '',
    startTime: timeSlot?.start ? new Date(timeSlot.start).toISOString().slice(0, 16) : '',
    endTime: timeSlot?.end ? new Date(timeSlot.end).toISOString().slice(0, 16) : '',
    status: 'Scheduled' as const,
  });

  const [selectedSample, setSelectedSample] = useState<Sample | null>(null);
  const [selectedAliquot, setSelectedAliquot] = useState<any | null>(null);
  const [selectedTest, setSelectedTest] = useState<any | null>(null);
  const [overlaps, setOverlaps] = useState<any[]>([]);
  const [isFormValid, setIsFormValid] = useState(false);
  const [resourceAvailability, setResourceAvailability] = useState<{
    equipment: { id: string; conflicts: any[] }[];
    analysts: { id: string; conflicts: any[] }[];
  }>({
    equipment: [],
    analysts: []
  });

  // Validate form completeness
  useEffect(() => {
    setIsFormValid(
      Boolean(
        formData.sampleId &&
        formData.aliquotId &&
        formData.testId &&
        formData.stepName &&
        formData.equipmentId &&
        formData.analystId &&
        formData.startTime &&
        formData.endTime
      )
    );
  }, [formData]);

  // Check resource availability when equipment or analyst changes
  useEffect(() => {
    if (formData.equipmentId && formData.analystId && formData.startTime && formData.endTime) {
      const conflicts = checkResourceAvailability(
        testSteps,
        formData.startTime,
        formData.endTime,
        formData.equipmentId,
        formData.analystId
      );
      setOverlaps(conflicts);
    }
  }, [formData.equipmentId, formData.analystId, formData.startTime, formData.endTime, testSteps]);

  useEffect(() => {
    if (timeSlot) {
      // Convert UTC dates to local datetime-local input value
      const startDate = new Date(timeSlot.start);
      const endDate = new Date(timeSlot.end);
      
      setFormData(prev => ({
        ...prev,
        startTime: startDate.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T'),
        endTime: endDate.toLocaleString('sv-SE', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(' ', 'T')
      }));
    }
  }, [timeSlot]);

  // Check availability for all resources when time slot changes
  useEffect(() => {
    if (formData.startTime && formData.endTime) {
      const equipmentAvailability = equipment.map(item => ({
        id: item.id,
        conflicts: testSteps.filter(step =>
          step.equipmentId === item.id &&
          hasOverlap(formData.startTime, formData.endTime, step.startTime, step.endTime)
        )
      }));

      const analystAvailability = analysts.map(analyst => ({
        id: analyst.id,
        conflicts: testSteps.filter(step =>
          step.analystId === analyst.id &&
          hasOverlap(formData.startTime, formData.endTime, step.startTime, step.endTime)
        )
      }));

      setResourceAvailability({
        equipment: equipmentAvailability,
        analysts: analystAvailability
      });
    }
  }, [formData.startTime, formData.endTime, testSteps, equipment, analysts]);

  useEffect(() => {
    if (formData.sampleId) {
      const sample = samples.find(s => s.id === formData.sampleId);
      setSelectedSample(sample || null);
      setFormData(prev => ({ ...prev, aliquotId: '', testId: '' }));
    }
  }, [formData.sampleId, samples]);

  useEffect(() => {
    if (selectedSample && formData.aliquotId) {
      const aliquot = selectedSample.aliquots.find(a => a.id === formData.aliquotId);
      setSelectedAliquot(aliquot || null);
      setFormData(prev => ({ ...prev, testId: '' }));
    }
  }, [formData.aliquotId, selectedSample]);

  useEffect(() => {
    if (selectedAliquot && formData.testId) {
      const test = selectedAliquot.tests.find((t: any) => t.id === formData.testId);
      setSelectedTest(test || null);
    }
  }, [formData.testId, selectedAliquot]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({
      id: `STEP_${Date.now()}`,
      ...formData,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Schedule New Test Step</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Sample Selection */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sample
              </label>
              <select
                value={formData.sampleId}
                onChange={(e) => setFormData(prev => ({ ...prev, sampleId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select a sample...</option>
                {samples.map(sample => (
                  <option key={sample.id} value={sample.id}>
                    {sample.id} - {sample.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedSample && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aliquot
                </label>
                <select
                  value={formData.aliquotId}
                  onChange={(e) => setFormData(prev => ({ ...prev, aliquotId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select an aliquot...</option>
                  {selectedSample.aliquots.map(aliquot => (
                    <option key={aliquot.id} value={aliquot.id}>
                      {aliquot.id} - {aliquot.volume} units
                    </option>
                  ))}
                </select>
              </div>
            )}

            {selectedAliquot && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test
                </label>
                <select
                  value={formData.testId}
                  onChange={(e) => setFormData(prev => ({ ...prev, testId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a test...</option>
                  {selectedAliquot.tests.map((test: any) => (
                    <option key={test.id} value={test.id}>
                      {test.name} - {test.method}
                    </option>
                  ))}
                </select>
              </div>
            )}
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
                onChange={(e) => setFormData(prev => ({ ...prev, stepName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter step name"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Equipment
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <select
                      value={formData.equipmentId}
                      onChange={(e) => setFormData(prev => ({ ...prev, equipmentId: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      required
                    >
                      <option value="">Select equipment...</option>
                    {equipment.map((item) => {
                      const availability = resourceAvailability.equipment.find(e => e.id === item.id);
                      const conflicts = availability?.conflicts || [];
                      const isAvailable = conflicts.length === 0;
                      
                      return (
                        <option
                          key={item.id} 
                          value={item.id}
                          className={isAvailable ? 'text-gray-900' : 'text-red-600'}
                        >
                          {item.name}
                        </option>
                      );
                    })}
                    </select>
                  </div>

                  {formData.equipmentId && (
                    <div>
                      {resourceAvailability.equipment
                        .find(e => e.id === formData.equipmentId)
                        ?.conflicts.length === 0 ? (
                        <div className="flex items-center bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          <span className="text-sm font-medium">Available during selected time</span>
                        </div>
                      ) : (
                        <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg space-y-1">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                            <span className="text-sm font-medium">Conflicts Found</span>
                          </div>
                          <div className="pl-4 text-sm">
                            {resourceAvailability.equipment
                              .find(e => e.id === formData.equipmentId)
                              ?.conflicts.map(conflict => (
                                <div key={conflict.id} className="flex items-center space-x-2">
                                  <span>•</span>
                                  <span>{conflict.stepName}</span>
                                  <span className="text-red-500">
                                    ({new Date(conflict.startTime).toLocaleTimeString()} - {new Date(conflict.endTime).toLocaleTimeString()})
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Analyst
                </label>
                <div className="space-y-3">
                  <div className="relative">
                    <select
                      value={formData.analystId}
                      onChange={(e) => setFormData(prev => ({ ...prev, analystId: e.target.value }))}
                      className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                      required
                    >
                      <option value="">Select analyst...</option>
                    {analysts.map((analyst) => {
                      const availability = resourceAvailability.analysts.find(a => a.id === analyst.id);
                      const conflicts = availability?.conflicts || [];
                      const isAvailable = conflicts.length === 0;
                      
                      return (
                        <option
                          key={analyst.id} 
                          value={analyst.id}
                          className={isAvailable ? 'text-gray-900' : 'text-red-600'}
                        >
                          {analyst.name}
                        </option>
                      );
                    })}
                    </select>
                  </div>

                  {formData.analystId && (
                    <div>
                      {resourceAvailability.analysts
                        .find(a => a.id === formData.analystId)
                        ?.conflicts.length === 0 ? (
                        <div className="flex items-center bg-green-50 text-green-700 px-3 py-2 rounded-lg">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                          <span className="text-sm font-medium">Available during selected time</span>
                        </div>
                      ) : (
                        <div className="bg-red-50 text-red-700 px-3 py-2 rounded-lg space-y-1">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                            <span className="text-sm font-medium">Conflicts Found</span>
                          </div>
                          <div className="pl-4 text-sm">
                            {resourceAvailability.analysts
                              .find(a => a.id === formData.analystId)
                              ?.conflicts.map(conflict => (
                                <div key={conflict.id} className="flex items-center space-x-2">
                                  <span>•</span>
                                  <span>{conflict.stepName}</span>
                                  <span className="text-red-500">
                                    ({new Date(conflict.startTime).toLocaleTimeString()} - {new Date(conflict.endTime).toLocaleTimeString()})
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            <div className="grid grid-cols-2 gap-4 col-span-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  style={{ minWidth: '250px' }}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                  style={{ minWidth: '250px' }}
                  required
                />
              </div>
            </div>
          </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            {overlaps.length > 0 && (
              <div className="flex-1">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
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
              </div>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || overlaps.length > 0}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Schedule Test Step
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}