import React from 'react';

const MATERIAL_TYPES = [
  { id: 'drug_substance', name: 'Drug Substance', description: 'Active pharmaceutical ingredient (API)' },
  { id: 'drug_product', name: 'Drug Product', description: 'Final formulated product' }
];

const SYNTHESIS_TYPES = [
  { id: 'chemical', name: 'Chemical Synthesis', description: 'Chemically synthesized compounds' },
  { id: 'biological', name: 'Biological/Biotechnological', description: 'Products derived from biological sources' }
];

interface MaterialTypeStepProps {
  formData: {
    materialType: string;
    synthesisType: string;
    version: string;
    status: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function MaterialTypeStep({ formData, setFormData }: MaterialTypeStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Material Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          {MATERIAL_TYPES.map(type => (
            <label
              key={type.id}
              className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.materialType === type.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="flex items-start">
                <input
                  type="radio"
                  name="materialType"
                  value={type.id}
                  checked={formData.materialType === type.id}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    materialType: e.target.value
                  }))}
                  className="sr-only"
                />
                <div>
                  <p className="font-medium text-gray-900">{type.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 mt-4">
          Synthesis Type
        </label>
        <div className="grid grid-cols-2 gap-4">
          {SYNTHESIS_TYPES.map(type => (
            <label
              key={type.id}
              className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${
                formData.synthesisType === type.id
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 hover:border-blue-200'
              }`}
            >
              <div className="flex items-start">
                <input
                  type="radio"
                  name="synthesisType"
                  value={type.id}
                  checked={formData.synthesisType === type.id}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    synthesisType: e.target.value
                  }))}
                  className="sr-only"
                />
                <div>
                  <p className="font-medium text-gray-900">{type.name}</p>
                  <p className="text-sm text-gray-500 mt-1">{type.description}</p>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mt-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Version
          </label>
          <input
            type="text"
            value={formData.version}
            onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Draft">Draft</option>
            <option value="Active">Active</option>
            <option value="Obsolete">Obsolete</option>
          </select>
        </div>
      </div>
    </div>
  );
}