import React from 'react';

const REGIONS = [
  { id: 'us', name: 'United States', guidelines: ['FDA', 'USP'] },
  { id: 'eu', name: 'European Union', guidelines: ['EMA', 'Ph. Eur.'] },
  { id: 'jp', name: 'Japan', guidelines: ['PMDA', 'JP'] },
  { id: 'in', name: 'India', guidelines: ['CDSCO', 'IP'] },
  { id: 'cn', name: 'China', guidelines: ['NMPA', 'ChP'] }
];

interface RegionsStepProps {
  formData: {
    regions: string[];
    regulatoryGuidelines: string[];
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export default function RegionsStep({ formData, setFormData }: RegionsStepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-3">Select Distribution Regions</h3>
        <div className="grid grid-cols-2 gap-4">
          {REGIONS.map(region => (
            <label
              key={region.id}
              className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
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
      </div>

      {formData.regulatoryGuidelines.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Selected Guidelines</h4>
          <div className="flex flex-wrap gap-2">
            {formData.regulatoryGuidelines.map(guideline => (
              <span
                key={guideline}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
              >
                {guideline}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Regulatory Impact</h4>
        <p className="text-sm text-yellow-700">
          The regions you select will determine which regulatory guidelines are applied to your specifications.
          This affects acceptance criteria, testing methods, and documentation requirements.
        </p>
        <ul className="mt-2 space-y-1 text-sm text-yellow-700 list-disc list-inside">
          <li>US FDA requires compliance with USP methods and monographs</li>
          <li>EU EMA requires compliance with Ph. Eur. methods and monographs</li>
          <li>Japan PMDA requires compliance with JP methods and monographs</li>
        </ul>
      </div>
    </div>
  );
}