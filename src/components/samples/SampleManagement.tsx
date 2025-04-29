import React, { useState } from 'react';
import { Plus, List, Columns, Search, Filter, Download, X, Trash2 } from 'lucide-react';
import { useSamples } from '../../context/SampleContext';
import KanbanView from './views/KanbanView';
import TableView from './views/TableView';
import SampleRegistrationModal from './modals/SampleRegistrationModal';

type ViewMode = 'kanban' | 'table';

interface FilterState {
  type: string[];
  status: string[];
  location: string[];
  owner: string[];
}

const SAMPLE_TYPES = [
  'API Raw Material',
  'Excipient',
  'In-Process Material',
  'Finished Product',
  'Reference Standard',
  'Stability Sample',
  'Validation Material'
];

const SAMPLE_STATUSES = [
  'Quarantine',
  'Quality Control',
  'Stability Testing',
  'Method Validation',
  'Release Testing',
  'Documentation Review',
  'Released',
  'Rejected'
];

const LAB_LOCATIONS = [
  'QC Lab',
  'Analytical Lab',
  'Stability Chamber',
  'Method Lab',
  'Reference Lab',
  'Sample Storage',
  'Quarantine Area'
];

const SAMPLE_OWNERS = [
  'Dr. Sarah Chen',
  'Dr. Michael Rodriguez',
  'Dr. Emily Taylor',
  'Dr. James Wilson',
  'Dr. Lisa Anderson'
];

interface SampleManagementProps {
  onSampleClick: (sampleId: string) => void;
}

export default function SampleManagement({ onSampleClick }: SampleManagementProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sampleToDelete, setSampleToDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    status: [],
    location: [],
    owner: [],
  });
  
  const { samples, deleteSample } = useSamples();
  
  const filteredSamples = samples.filter(sample => {
    const typeMatch = filters.type.length === 0 || filters.type.includes(sample.type);
    const statusMatch = filters.status.length === 0 || filters.status.includes(sample.status);
    const locationMatch = filters.location.length === 0 || filters.location.includes(sample.location);
    const ownerMatch = filters.owner.length === 0 || filters.owner.includes(sample.owner);
    const searchMatch = searchQuery === '' || 
      sample.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sample.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    return typeMatch && statusMatch && locationMatch && ownerMatch && searchMatch;
  });

  const toggleFilter = (category: keyof FilterState, value: string) => {
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
      status: [],
      location: [],
      owner: [],
    });
  };

  const handleDeleteSample = () => {
    if (sampleToDelete) {
      deleteSample(sampleToDelete);
      setShowDeleteModal(false);
      setSampleToDelete(null);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Sample ID',
      'Sample Name',
      'Type',
      'Status',
      'Owner',
      'Box ID',
      'Storage Location',
      'Last Movement',
    ];

    const csvContent = [
      headers.join(','),
      ...filteredSamples.map(sample => [
        sample.id,
        sample.name,
        sample.type,
        sample.status,
        sample.owner,
        sample.boxId,
        sample.location,
        sample.lastMovement
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `samples_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="h-full p-6">
      {/* Header Section */}
      <div className="mb-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-semibold text-gray-900">Sample Management</h1>
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1 shadow-sm">
             <button
               onClick={() => setViewMode('table')}
               className={`px-3 py-1.5 rounded ${
                 viewMode === 'table'
                   ? 'bg-blue-50 text-blue-600'
                   : 'text-gray-600 hover:text-gray-900'
               }`}
             >
               <List className="w-5 h-5" />
             </button>
             <button
               onClick={() => setViewMode('kanban')}
               className={`px-3 py-1.5 rounded ${
                 viewMode === 'kanban'
                   ? 'bg-blue-50 text-blue-600'
                   : 'text-gray-600 hover:text-gray-900'
               }`}
             >
               <Columns className="w-5 h-5" />
             </button>
           </div>
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
                {Object.values(filters).reduce((acc, curr) => acc + curr.length, 0)}
              </span>
            )}
          </button>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search samples..."
              className="pl-9 pr-4 py-2 w-[400px] text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 shadow-sm"
            />
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsRegistrationModalOpen(true)}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Sample
          </button>
          <button
            onClick={exportToCSV}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm h-[calc(100vh-12rem)]">
        {viewMode === 'kanban' ? (
          <KanbanView onSampleClick={onSampleClick} />
        ) : (
          <TableView 
            samples={filteredSamples} 
            onSampleClick={onSampleClick} 
            onDeleteSample={(id) => {
              setSampleToDelete(id);
              setShowDeleteModal(true);
            }}
          />
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && sampleToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-[400px]">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-gray-900">Delete Sample</h3>
                <p className="mt-2 text-sm text-gray-500">
                  Are you sure you want to delete this sample? This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSampleToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 mr-3"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSample}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      <SampleRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
      />
      
      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-lg shadow-xl w-[800px]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filter Samples</h2>
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
                {/* Sample Type Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Sample Type</h3>
                  <div className="space-y-3">
                    {SAMPLE_TYPES.map(type => (
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
                    {SAMPLE_STATUSES.map(status => (
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
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Lab Location</h3>
                  <div className="space-y-3">
                    {LAB_LOCATIONS.map(location => (
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

                {/* Owner Filter */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Owner</h3>
                  <div className="space-y-3">
                    {SAMPLE_OWNERS.map(owner => (
                      <label key={owner} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.owner.includes(owner)}
                          onChange={() => toggleFilter('owner', owner)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-600">{owner}</span>
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
    </div>
  );
}