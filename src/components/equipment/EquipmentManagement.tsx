import React, { useState } from 'react';
import { Plus, List, Columns, Search, Filter, Download, X, Trash2 } from 'lucide-react';
import { useEquipment, EquipmentType, EquipmentStatus } from '../../context/EquipmentContext';
import EquipmentTable from './views/EquipmentTable';
import NewEquipmentModal from './modals/NewEquipmentModal';

interface FilterState {
  type: EquipmentType[];
  location: string[];
  status: EquipmentStatus[];
  manufacturer: string[];
  calibrationDue: boolean;
}

const EQUIPMENT_TYPES: EquipmentType[] = [
  'HPLC',
  'Centrifuge',
  'Microscope',
  'PCR',
  'Spectrophotometer',
  'Balance',
  'pH Meter'
];

const LOCATIONS = [
  'Lab 1',
  'Lab 2',
  'Lab 3',
  'Lab 4',
  'Lab 5'
];

const MANUFACTURERS = [
  'Agilent',
  'Thermo Fisher',
  'Waters',
  'Shimadzu',
  'Perkin Elmer'
];

const STATUSES: EquipmentStatus[] = [
  'Available',
  'In Use',
  'Under Maintenance',
  'Out of Service',
  'Quarantined'
];

export default function EquipmentManagement({ onEquipmentClick }: EquipmentManagementProps) {
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    location: [],
    status: [],
    manufacturer: [],
    calibrationDue: false
  });
  const { equipment, deleteEquipment } = useEquipment();

  const filteredEquipment = equipment.filter(item => {
    const matchesType = filters.type.length === 0 || filters.type.includes(item.type);
    const matchesLocation = filters.location.length === 0 || filters.location.includes(item.location);
    const matchesStatus = filters.status.length === 0 || filters.status.includes(item.status);
    const matchesManufacturer = filters.manufacturer.length === 0 || filters.manufacturer.includes(item.manufacturer);
    const matchesCalibration = !filters.calibrationDue ||
      (new Date(item.calibration.nextDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24) <= 7;
    const matchesSearch = searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesLocation && matchesStatus && matchesManufacturer && matchesCalibration && matchesSearch;
  });

  const toggleFilter = (category: keyof FilterState, value: any) => {
    if (category === 'calibrationDue') {
      setFilters(prev => ({
        ...prev,
        [category]: value
      }));
      return;
    }

    setFilters(prev => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }));
  };

  const clearFilters = () => {
    setFilters({
      type: [],
      location: [],
      status: [],
      manufacturer: [],
      calibrationDue: false
    });
  };

  return (
    <div className="h-full p-6">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-semibold text-gray-800">Equipment Management</h1>
        </div>
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFilters(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {Object.values(filters).some(f => f.length > 0) && (
              <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                {Object.values(filters).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : curr ? 1 : 0), 0)}
              </span>
            )}
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equipment..."
              className="pl-9 pr-4 py-2 w-[400px] text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsNewItemModalOpen(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Equipment
          </button>
          <button
            onClick={() => {/* Handle export */}}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[calc(100vh-12rem)]">
        <EquipmentTable 
          equipment={filteredEquipment} 
          onEquipmentClick={onEquipmentClick} 
          onDeleteEquipment={(id) => {
            setEquipmentToDelete(id);
            setShowDeleteModal(true);
          }}
        />
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && equipmentToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[400px]">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">Delete Equipment</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete this equipment? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setEquipmentToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 mr-3"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (equipmentToDelete) {
                    deleteEquipment(equipmentToDelete);
                    setShowDeleteModal(false);
                    setEquipmentToDelete(null);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-lg shadow-xl w-[900px]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filter Equipment</h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={clearFilters}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  Clear all
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-4 gap-8">
                {/* Equipment Type Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Equipment Type</h3>
                  <div className="space-y-3">
                    {EQUIPMENT_TYPES.map(type => (
                      <label key={type} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.type.includes(type)}
                          onChange={() => toggleFilter('type', type)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Status</h3>
                  <div className="space-y-3">
                    {STATUSES.map(status => (
                      <label key={status} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.status.includes(status)}
                          onChange={() => toggleFilter('status', status)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{status}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Location Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Location</h3>
                  <div className="space-y-3">
                    {LOCATIONS.map(location => (
                      <label key={location} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.location.includes(location)}
                          onChange={() => toggleFilter('location', location)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{location}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Manufacturer Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Manufacturer</h3>
                  <div className="space-y-3">
                    {MANUFACTURERS.map(manufacturer => (
                      <label key={manufacturer} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.manufacturer.includes(manufacturer)}
                          onChange={() => toggleFilter('manufacturer', manufacturer)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{manufacturer}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Equipment Modal */}
      <NewEquipmentModal
        isOpen={isNewItemModalOpen}
        onClose={() => setIsNewItemModalOpen(false)}
      />
    </div>
  );
}