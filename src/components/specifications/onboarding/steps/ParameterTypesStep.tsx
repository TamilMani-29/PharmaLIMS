import React from 'react';
import { Check } from 'lucide-react';
import { SpecificationType } from '../../../../context/SpecificationContext';

const PARAMETER_TYPES: { type: SpecificationType; examples: string[] }[] = [
  {
    type: 'Physical',
    examples: ['Appearance', 'Color', 'Viscosity', 'pH', 'Particle Size']
  },
  {
    type: 'Chemical',
    examples: ['Assay', 'Impurities', 'Residual Solvents', 'Water Content']
  },
  {
    type: 'Microbial',
    examples: ['Total Aerobic Count', 'Total Yeast/Mold', 'Specific Pathogens']
  },
  {
    type: 'Performance',
    examples: ['Dissolution', 'Disintegration', 'Hardness', 'Friability']
  },
  {
    type: 'Stability',
    examples: ['Accelerated Stability', 'Long-term Stability', 'Photostability']
  }
];

interface ParameterTypesStepProps {
  formData: {
    selectedParameterTypes: SpecificationType[];
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  materialType: string;
  synthesisType: string;
}

export default function ParameterTypesStep({ 
  formData, 
  setFormData,
  materialType,
  synthesisType
}: ParameterTypesStepProps) {
  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Required Tests</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-center">
            <Check className="w-4 h-4 mr-2" />
            Identification Test (Required by ICH Q6A)
          </li>
          {materialType === 'drug_product' && (
            <>
              <li className="flex items-center">
                <Check className="w-4 h-4 mr-2" />
                Content Uniformity Test
              </li>
              <li className="flex items-center">
                <Check className="w-4 h-4 mr-2" />
                Dissolution/Disintegration Test
              </li>
            </>
          )}
          {synthesisType === 'biological' && (
            <li className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Biological Activity Test
            </li>
          )}
        </ul>
      </div>

      <h3 className="text-sm font-medium text-gray-900 mb-3">Additional Characteristics to Specify</h3>
      <div className="grid grid-cols-2 gap-6">
        {PARAMETER_TYPES.map(({ type, examples }) => (
          <label
            key={type}
            className={`flex flex-col p-4 border rounded-lg cursor-pointer transition-colors ${
              formData.selectedParameterTypes.includes(type)
                ? 'bg-blue-50 border-blue-200'
                : 'bg-white border-gray-200 hover:border-blue-200'
            }`}
          >
            <div className="flex items-start">
              <input
                type="checkbox"
                checked={formData.selectedParameterTypes.includes(type)}
                onChange={(e) => {
                  const newTypes = e.target.checked
                    ? [...formData.selectedParameterTypes, type]
                    : formData.selectedParameterTypes.filter(t => t !== type);
                  setFormData(prev => ({
                    ...prev,
                    selectedParameterTypes: newTypes
                  }));
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
              />
              <div className="ml-3">
                <p className="font-medium text-gray-900">{type}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Examples: {examples.join(', ')}
                </p>
              </div>
            </div>
          </label>
        ))}
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
        <h4 className="text-sm font-medium text-yellow-800 mb-2">Parameter Selection Guidance</h4>
        <p className="text-sm text-yellow-700">
          Select parameter types based on your product's critical quality attributes (CQAs) and regulatory requirements.
        </p>
        <ul className="mt-2 space-y-1 text-sm text-yellow-700 list-disc list-inside">
          <li>Physical parameters are essential for appearance and basic properties</li>
          <li>Chemical parameters ensure identity, purity, and potency</li>
          <li>Microbial parameters are critical for sterile products or those with bioburden limits</li>
          <li>Performance parameters assess how the product functions</li>
          <li>Stability parameters monitor degradation over time</li>
        </ul>
      </div>
    </div>
  );
}