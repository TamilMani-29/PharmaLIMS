import React, { useState } from 'react';
import { Check, Edit2, X } from 'lucide-react';
import { useSpecifications, Specification, SpecificationStatus } from '../../../context/SpecificationContext';
import { useTests } from '../../../context/TestContext';

interface OverviewTabProps {
  specification: Specification;
}

const MATERIAL_TYPES = [
  { id: 'drug_substance', name: 'Drug Substance' },
  { id: 'drug_product', name: 'Drug Product' }
];

const SYNTHESIS_TYPES = [
  { id: 'chemical', name: 'Chemical Synthesis' },
  { id: 'biological', name: 'Biological/Biotechnological' }
];

const REGIONS = [
  { id: 'us', name: 'United States', guidelines: ['FDA', 'USP'] },
  { id: 'eu', name: 'European Union', guidelines: ['EMA', 'Ph. Eur.'] },
  { id: 'jp', name: 'Japan', guidelines: ['PMDA', 'JP'] },
  { id: 'in', name: 'India', guidelines: ['CDSCO', 'IP'] },
  { id: 'cn', name: 'China', guidelines: ['NMPA', 'ChP'] }
];

export default function OverviewTab({ specification }: OverviewTabProps) {
  const { updateSpecification } = useSpecifications();
  const { tests } = useTests();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: specification.name,
    version: specification.version,
    status: specification.status,
    regions: specification.regions,
    regulatoryGuidelines: specification.regulatoryGuidelines
  });

  const linkedTests = tests.filter(test => specification.linkedTestIds.includes(test.id));

  const getStatusColor = (status: SpecificationStatus) => {
    switch (status) {
      case 'Draft':
        return 'bg-gray-100 text-gray-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Obsolete':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSave = () => {
    updateSpecification(specification.id, formData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
          <div className="flex items-center space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save
                </button>
                <button
                  onClick={() => {
                    setFormData({
                      name: specification.name,
                      version: specification.version,
                      status: specification.status,
                      regions: specification.regions,
                      regulatoryGuidelines: specification.regulatoryGuidelines
                    });
                    setIsEditing(false);
                  }}
                  className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Edit
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-900">{specification.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Version
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <p className="text-sm text-gray-900">v{specification.version}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            {isEditing ? (
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as SpecificationStatus }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Obsolete">Obsolete</option>
              </select>
            ) : (
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(specification.status)}`}>
                {specification.status}
              </span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created By
            </label>
            <p className="text-sm text-gray-900">{specification.createdBy}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Created At
            </label>
            <p className="text-sm text-gray-900">
              {new Date(specification.createdAt).toLocaleString()}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Updated
            </label>
            <p className="text-sm text-gray-900">
              {new Date(specification.updatedAt).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Distribution */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Distribution</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Regions
            </label>
            {isEditing ? (
              <div className="grid grid-cols-2 gap-3">
                {REGIONS.map(region => (
                  <label
                    key={region.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.regions.includes(region.id)
                        ? 'bg-blue-50 border-blue-200'
                        : 'bg-white border-gray-200 hover:border-blue-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.regions.includes(region.id)}
                      onChange={(e) => {
                        const newRegions = e.target.checked
                          ? [...formData.regions, region.id]
                          : formData.regions.filter(r => r !== region.id);
                        
                        const newGuidelines = e.target.checked
                          ? [...formData.regulatoryGuidelines, ...region.guidelines]
                          : formData.regulatoryGuidelines.filter(g => !region.guidelines.includes(g));

                        setFormData(prev => ({
                          ...prev,
                          regions: newRegions,
                          regulatoryGuidelines: [...new Set(newGuidelines)]
                        }));
                      }}
                      className="sr-only"
                    />
                    <div>
                      <p className="font-medium text-gray-900">{region.name}</p>
                      <p className="text-sm text-gray-500">{region.guidelines.join(', ')}</p>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {specification.regions.map(regionId => {
                  const region = REGIONS.find(r => r.id === regionId);
                  return (
                    <div
                      key={regionId}
                      className="px-3 py-2 bg-gray-100 rounded-lg"
                    >
                      <p className="font-medium text-gray-900">{region?.name}</p>
                      <p className="text-sm text-gray-500">
                        {region?.guidelines.join(', ')}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Regulatory Guidelines
            </label>
            <div className="flex flex-wrap gap-2">
              {specification.regulatoryGuidelines.map(guideline => (
                <span
                  key={guideline}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {guideline}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Statistics</h3>
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500">Parameters</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {specification.parameters.length}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {specification.parameters.filter(p => p.mandatory).length} mandatory
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500">Linked Tests</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {specification.linkedTestIds.length}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {linkedTests.filter(t => t.status === 'Completed').length} completed
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm font-medium text-gray-500">Test Methods</p>
            <p className="mt-2 text-3xl font-semibold text-gray-900">
              {specification.parameters.filter(p => p.testMethod).length}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              Defined methods
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}