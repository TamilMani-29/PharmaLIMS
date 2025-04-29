import React from 'react';
import { X, Filter, Check, Calendar, Users, Wrench, Clock } from 'lucide-react';
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

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: {
    sampleId: string;
    aliquotId: string;
    status: string[];
    equipment: string[];
    analyst: string[];
  };
  onFiltersChange: (filters: any) => void;
  samples: Sample[];
  equipment: Equipment[];
  analysts: Analyst[];
}

export default function FiltersModal({
  isOpen,
  onClose,
  filters,
  onFiltersChange,
  samples,
  equipment,
  analysts,
}: FiltersModalProps) {
  if (!isOpen) return null;

  const handleStatusChange = (status: string) => {
    const newStatuses = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatuses });
  };

  const handleEquipmentChange = (equipmentId: string) => {
    const newEquipment = filters.equipment.includes(equipmentId)
      ? filters.equipment.filter(e => e !== equipmentId)
      : [...filters.equipment, equipmentId];
    onFiltersChange({ ...filters, equipment: newEquipment });
  };

  const handleAnalystChange = (analystId: string) => {
    const newAnalysts = filters.analyst.includes(analystId)
      ? filters.analyst.filter(a => a !== analystId)
      : [...filters.analyst, analystId];
    onFiltersChange({ ...filters, analyst: newAnalysts });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
      <div className="bg-white rounded-lg shadow-xl w-[800px] max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Filter className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Filter Test Steps</h2>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => onFiltersChange({
                sampleId: '',
                aliquotId: '',
                status: [],
                equipment: [],
                analyst: [],
              })}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear all
            </button>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="space-y-6">
            {/* Sample Selection */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-sm font-medium text-gray-900">Sample Selection</h3>
              </div>
              <select
                value={filters.sampleId}
                onChange={(e) => {
                  onFiltersChange({
                    ...filters,
                    sampleId: e.target.value,
                    aliquotId: '',
                  });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Samples</option>
                {samples.map(sample => (
                  <option key={sample.id} value={sample.id}>
                    {sample.id} - {sample.name}
                  </option>
                ))}
              </select>
            </div>

            {filters.sampleId && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-3">
                  <Calendar className="w-5 h-5 text-blue-600 mr-2" />
                  <h3 className="text-sm font-medium text-gray-900">Aliquot Selection</h3>
                </div>
                <select
                  value={filters.aliquotId}
                  onChange={(e) => onFiltersChange({ ...filters, aliquotId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All Aliquots</option>
                  {samples
                    .find(s => s.id === filters.sampleId)
                    ?.aliquots.map(aliquot => (
                      <option key={aliquot.id} value={aliquot.id}>
                        {aliquot.id}
                      </option>
                    ))}
                </select>
              </div>
            )}

            {/* Status Filter */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Clock className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-sm font-medium text-gray-900">Status</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {['Scheduled', 'In Progress', 'Completed'].map(status => (
                  <label
                    key={status}
                    className={`flex items-center p-3 rounded-lg border transition-colors ${
                      filters.status.includes(status)
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.status.includes(status)}
                      onChange={() => handleStatusChange(status)}
                      className="sr-only"
                    />
                    <Check
                      className={`w-4 h-4 mr-2 transition-opacity ${
                        filters.status.includes(status) ? 'opacity-100 text-blue-600' : 'opacity-0'
                      }`}
                    />
                    <span className={`text-sm ${
                      filters.status.includes(status) ? 'text-blue-900' : 'text-gray-600'
                    }`}>{status}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Equipment Filter */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Wrench className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-sm font-medium text-gray-900">Equipment</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {equipment.map(item => (
                  <label
                    key={item.id}
                    className={`flex items-center p-3 rounded-lg border transition-colors ${
                      filters.equipment.includes(item.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.equipment.includes(item.id)}
                      onChange={() => handleEquipmentChange(item.id)}
                      className="sr-only"
                    />
                    <Check
                      className={`w-4 h-4 mr-2 transition-opacity ${
                        filters.equipment.includes(item.id) ? 'opacity-100 text-blue-600' : 'opacity-0'
                      }`}
                    />
                    <span className={`text-sm ${
                      filters.equipment.includes(item.id) ? 'text-blue-900' : 'text-gray-600'
                    }`}>{item.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Analyst Filter */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Users className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-sm font-medium text-gray-900">Analyst</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {analysts.map(analyst => (
                  <label
                    key={analyst.id}
                    className={`flex items-center p-3 rounded-lg border transition-colors ${
                      filters.analyst.includes(analyst.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={filters.analyst.includes(analyst.id)}
                      onChange={() => handleAnalystChange(analyst.id)}
                      className="sr-only"
                    />
                    <Check
                      className={`w-4 h-4 mr-2 transition-opacity ${
                        filters.analyst.includes(analyst.id) ? 'opacity-100 text-blue-600' : 'opacity-0'
                      }`}
                    />
                    <span className={`text-sm ${
                      filters.analyst.includes(analyst.id) ? 'text-blue-900' : 'text-gray-600'
                    }`}>{analyst.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-700 mr-3"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </div>
  );
}