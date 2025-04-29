import React, { useState } from 'react';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { useSpecifications, SpecificationStatus, SpecificationType } from '../../../context/SpecificationContext';
import { useTests } from '../../../context/TestContext';
import { useProducts } from '../../../context/ProductContext';

interface NewSpecificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
}

type Step = 'context' | 'distribution' | 'scope' | 'parameters' | 'tests';

const MATERIAL_TYPES = [
  { id: 'drug_substance', name: 'Drug Substance', description: 'Active pharmaceutical ingredient (API)' },
  { id: 'drug_product', name: 'Drug Product', description: 'Final formulated product' }
];

const SYNTHESIS_TYPES = [
  { id: 'chemical', name: 'Chemical Synthesis', description: 'Chemically synthesized compounds' },
  { id: 'biological', name: 'Biological/Biotechnological', description: 'Products derived from biological sources' }
];

const REGIONS = [
  { id: 'us', name: 'United States', guidelines: ['FDA', 'USP'] },
  { id: 'eu', name: 'European Union', guidelines: ['EMA', 'Ph. Eur.'] },
  { id: 'jp', name: 'Japan', guidelines: ['PMDA', 'JP'] },
  { id: 'in', name: 'India', guidelines: ['CDSCO', 'IP'] },
  { id: 'cn', name: 'China', guidelines: ['NMPA', 'ChP'] }
];

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

export default function NewSpecificationModal({ isOpen, onClose, productId }: NewSpecificationModalProps) {
  const { addSpecification } = useSpecifications();
  const { tests } = useTests();
  const { products } = useProducts();
  const [currentStep, setCurrentStep] = useState<Step>('context');
  const [generatedSpecs, setGeneratedSpecs] = useState<Array<{
    name: string;
    description: string;
    parameters: Array<{
      name: string;
      type: SpecificationType;
      unit: string;
      expectedValue: string;
      testMethod?: string;
      mandatory: boolean;
    }>;
  }>>([]);
  const [formData, setFormData] = useState({
    name: '',
    materialType: '',
    synthesisType: '',
    version: '1.0',
    status: 'Draft' as SpecificationStatus,
    regions: [] as string[],
    regulatoryGuidelines: [] as string[],
    parameters: [] as Array<{
      name: string;
      type: SpecificationType;
      unit: string;
      expectedValue: string;
      acceptableRange?: { min: number; max: number };
      testMethod?: string;
      mandatory: boolean;
      linkedTestIds?: string[];
    }>,
    selectedParameterTypes: [] as SpecificationType[],
    linkedTestIds: [] as string[]
  });

  if (!isOpen) return null;

  const handleSubmit = async () => {
    // Create all generated specifications
    for (const spec of generatedSpecs) {
      addSpecification({
        ...formData,
        name: spec.name, 
        description: spec.description,
        parameters: spec.parameters.map(param => ({
          ...param,
          linkedTestIds: param.linkedTestIds || []
        })),
        productId,
        createdBy: 'John Doe'
      });
    }
    onClose();
  };

  const generateSpecifications = () => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    let specs: typeof generatedSpecs = [];
    let parameterIdCounter = 1;
    let specIdCounter = 1;

    const createParameter = (param: Omit<SpecificationParameter, 'id'>) => {
      const id = `PARAM-${String(parameterIdCounter++).padStart(3, '0')}`;
      return { ...param, id };
    };

    const createSpecification = (name: string, description: string, parameters: Omit<SpecificationParameter, 'id'>[]) => {
      const id = `SPEC-${String(specIdCounter++).padStart(3, '0')}`;
      return {
        name,
        description,
        parameters: parameters.map(p => createParameter(p))
      };
    };

    // Base specifications based on ICH Q6A requirements
    if (formData.materialType === 'drug_substance') {
      specs.push(createSpecification(
        `${product.name} API Release Specification`,
        'Release specification for active pharmaceutical ingredient',
        [
          {
            name: 'FTIR Identification',
            type: 'Chemical',
            unit: 'N/A',
            expectedValue: 'IR spectrum matches reference standard',
            testMethod: 'USP <197K>',
            mandatory: true
          },
          {
            name: 'UV-Vis Identification',
            type: 'Chemical',
            unit: 'N/A',
            expectedValue: 'λmax at 243 nm',
            testMethod: 'USP-NF',
            mandatory: true
          },
          {
            name: 'Active Content',
            type: 'Chemical',
            unit: '%',
            expectedValue: '98.0% to 102.0% of label claim',
            testMethod: 'USP <621>, ICH Q6A',
            mandatory: true
          }
        ]
      ));

      specs.push(createSpecification(
        `${product.name} API Stability Specification`,
        'Stability specification for active pharmaceutical ingredient',
        [
          {
            name: 'Appearance',
            type: 'Physical',
            unit: 'N/A',
            expectedValue: 'White to off-white powder',
            mandatory: true
          },
          {
            name: 'Water Content',
            type: 'Chemical',
            unit: '%',
            expectedValue: '≤ 0.5',
            testMethod: 'USP <921>',
            mandatory: true
          }
        ]
      ));
    }

    if (formData.materialType === 'drug_product') {
      specs.push(createSpecification(
        `${product.name} Product Release Specification`,
        'Release specification for drug product',
        [
          {
            name: 'Weight Variation',
            type: 'Physical',
            unit: '%',
            expectedValue: '±5% deviation allowed for ≤2 units',
            testMethod: 'USP <905>',
            mandatory: true
          },
          {
            name: 'Content Uniformity',
            type: 'Physical',
            unit: '%',
            expectedValue: '85% to 115% for individual units',
            testMethod: 'USP <905>',
            mandatory: true
          },
          {
            name: 'Dissolution',
            type: 'Performance',
            unit: '%',
            expectedValue: 'NLT 80% in 30 minutes',
            testMethod: 'USP <711>, ICH Q6A',
            mandatory: true
          }
        ]
      ));

      specs.push(createSpecification(
        `${product.name} Product Stability Specification`,
        'Stability specification for drug product',
        [
          {
            name: 'Description',
            type: 'Physical',
            unit: 'N/A',
            expectedValue: 'White tablet with score line',
            mandatory: true
          },
          {
            name: 'Degradation Products',
            type: 'Chemical',
            unit: '%',
            expectedValue: '≤ 0.2% individual, ≤ 1.0% total',
            testMethod: 'USP <621>',
            mandatory: true
          }
        ]
      ));
    }

    // Add region-specific parameters
    if (formData.regions.includes('us')) {
      specs.forEach(spec => {
        // Add USP-specific requirements
        if (formData.materialType === 'drug_product') {
          const param = createParameter({
            name: 'USP Identification',
            type: 'Chemical' as SpecificationType,
            unit: 'N/A',
            expectedValue: 'Meets USP requirements',
            testMethod: 'USP monograph',
            mandatory: true
          });
          spec.parameters.push(param);
        }
      });
    }

    if (formData.regions.includes('eu')) {
      specs.forEach(spec => {
        // Add Ph. Eur. specific requirements
        if (formData.materialType === 'drug_product') {
          const param = createParameter({
            name: 'Ph. Eur. Identification',
            type: 'Chemical' as SpecificationType,
            unit: 'N/A',
            expectedValue: 'Meets Ph. Eur. requirements',
            testMethod: 'Ph. Eur. monograph',
            mandatory: true
          });
          spec.parameters.push(param);
        }
      });
    }

    // Add synthesis-specific parameters
    if (formData.synthesisType === 'biological') {
      specs.forEach(spec => {
        // Add biotech-specific requirements
        if (formData.materialType === 'drug_product') {
          const param = createParameter({
            name: 'Biological Activity',
            type: 'Performance' as SpecificationType,
            unit: '%',
            expectedValue: '80-120% of labeled potency',
            testMethod: 'USP <1032>, ICH Q6B',
            mandatory: true
          });
          spec.parameters.push(param);
        }
      });
    }

    // Add selected parameter types
    formData.selectedParameterTypes.forEach(type => {
      const examples = PARAMETER_TYPES.find(t => t.type === type)?.examples || [];
      // Add additional parameters based on ICH Q6A decision trees
      specs.forEach(spec => {
        switch (type) {
          case 'Physical': {
            const physicalParam = createParameter({
              name: 'Physical Description',
              type: 'Physical' as SpecificationType,
              unit: 'N/A',
              expectedValue: formData.materialType === 'drug_product' ? 
                'White to off-white tablet' : 'White crystalline powder',
              testMethod: 'Visual inspection',
              mandatory: true
            });
            spec.parameters.push(physicalParam);
            break;
          }
          case 'Chemical': {
            const chemicalParam = createParameter({
              name: 'Related Substances',
              type: 'Chemical' as SpecificationType,
              unit: '%',
              expectedValue: 'Individual: NMT 0.2%, Total: NMT 1.0%',
              testMethod: 'USP <621>',
              mandatory: true
            });
            spec.parameters.push(chemicalParam);
            break;
          }
          case 'Microbial': {
            const microbialParam = createParameter({
              name: 'Total Aerobic Microbial Count',
              type: 'Microbial' as SpecificationType,
              unit: 'CFU/g',
              expectedValue: 'NMT 1000',
              testMethod: 'USP <61>',
              mandatory: true
            });
            spec.parameters.push(microbialParam);
            break;
          }
        }
      });
    });

    setGeneratedSpecs(specs);
    setFormData(prev => ({
      ...prev,
      parameters: specs.flatMap(spec => spec.parameters)
    }));
  };

  const handleNext = () => {
    switch (currentStep) {
      case 'context':
        setCurrentStep('distribution');
        break;
      case 'distribution':
        setCurrentStep('scope');
        break;
      case 'scope':
        setCurrentStep('parameters');
        generateSpecifications();
        break;
      case 'parameters':
        setCurrentStep('tests');
        break;
      case 'tests':
        handleSubmit();
        break;
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'distribution':
        setCurrentStep('context');
        break;
      case 'scope':
        setCurrentStep('distribution');
        break;
      case 'parameters':
        setCurrentStep('scope');
        break;
      case 'tests':
        setCurrentStep('parameters');
        break;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'context':
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Version
              </label>
              <input
                type="text"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as SpecificationStatus }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              >
                <option value="Draft">Draft</option>
                <option value="Active">Active</option>
                <option value="Obsolete">Obsolete</option>
              </select>
            </div>
          </div>
        );

      case 'distribution':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-4">Select Distribution Regions</h3>
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
              <div className="mt-6">
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
          </div>
        );

      case 'scope':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Required Tests</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center">
                  <Check className="w-4 h-4 mr-2" />
                  Identification Test (Required by ICH Q6A)
                </li>
                {formData.materialType === 'drug_product' && (
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
                {formData.synthesisType === 'biological' && (
                  <li className="flex items-center">
                    <Check className="w-4 h-4 mr-2" />
                    Biological Activity Test
                  </li>
                )}
              </ul>
            </div>

            <h3 className="text-sm font-medium text-gray-900 mb-4">Additional Characteristics to Specify</h3>
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
          </div>
        );

      case 'parameters':
        return (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-green-900 mb-2">Generated Specifications</h3>
              <p className="text-sm text-green-700 mb-4">
                Based on your selections, the following specifications will be created:
              </p>
              <div className="space-y-4">
                {generatedSpecs.map((spec, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-green-100">
                    <h4 className="font-medium text-gray-900 mb-2">{spec.name}</h4>
                    <p className="text-sm text-gray-500 mb-2">{spec.description}</p>
                    <div className="mt-2">
                      <h5 className="text-sm font-medium text-gray-700 mb-1">Parameters:</h5>
                      <ul className="list-disc list-inside text-sm text-gray-600">
                        {spec.parameters.map((param, pIndex) => (
                          <li key={pIndex}>
                            {param.name} ({param.type}): {param.expectedValue} {param.unit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-medium text-yellow-900 mb-2">Important Notes</h3>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>• All acceptance criteria must be justified by data from batches used in clinical and/or stability studies</li>
                <li>• Consider process capability and analytical method variability when setting limits</li>
                <li>• For impurity limits, refer to ICH Q3A/B thresholds based on maximum daily dose</li>
              </ul>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Parameter
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acceptance Criteria
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test Method
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test to Perform
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Mandatory
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {formData.parameters.map((param, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                        {param.id || `PARAM-${String(index + 1).padStart(3, '0')}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <input
                          type="text"
                          value={param.name}
                          onChange={(e) => {
                            const newParams = [...formData.parameters];
                            newParams[index].name = e.target.value;
                            setFormData(prev => ({ ...prev, parameters: newParams }));
                          }}
                          className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={param.type}
                          onChange={(e) => {
                            const newParams = [...formData.parameters];
                            newParams[index].type = e.target.value as SpecificationType;
                            setFormData(prev => ({ ...prev, parameters: newParams }));
                          }}
                          className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          {formData.selectedParameterTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="text"
                          value={param.unit}
                          onChange={(e) => {
                            const newParams = [...formData.parameters];
                            newParams[index].unit = e.target.value;
                            setFormData(prev => ({ ...prev, parameters: newParams }));
                          }}
                          className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="text"
                          value={param.expectedValue}
                          onChange={(e) => {
                            const newParams = [...formData.parameters];
                            newParams[index].expectedValue = e.target.value;
                            setFormData(prev => ({ ...prev, parameters: newParams }));
                          }}
                          className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="text"
                          value={param.testMethod}
                          onChange={(e) => {
                            const newParams = [...formData.parameters];
                            newParams[index].testMethod = e.target.value;
                            setFormData(prev => ({ ...prev, parameters: newParams }));
                          }}
                          className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select
                          value={param.linkedTestIds?.[0] || ''}
                          onChange={(e) => {
                            const newParams = [...formData.parameters];
                            const testId = e.target.value;
                            
                            if (testId) {
                              newParams[index].linkedTestIds = [testId];
                              
                              // Also add to the specification's linkedTestIds if not already there
                              if (!formData.linkedTestIds.includes(testId)) {
                                setFormData(prev => ({
                                  ...prev,
                                  linkedTestIds: [...prev.linkedTestIds, testId],
                                  parameters: newParams
                                }));
                              } else {
                                setFormData(prev => ({
                                  ...prev,
                                  parameters: newParams
                                }));
                              }
                            } else {
                              newParams[index].linkedTestIds = [];
                              setFormData(prev => ({
                                ...prev,
                                parameters: newParams
                              }));
                            }
                          }}
                          className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        >
                          <option value="">Select a test</option>
                          {tests.map(test => (
                            <option key={test.id} value={test.id}>
                              {test.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <input
                          type="checkbox"
                          checked={param.mandatory}
                          onChange={(e) => {
                            const newParams = [...formData.parameters];
                            newParams[index].mandatory = e.target.checked;
                            setFormData(prev => ({
                              ...prev,
                              parameters: newParams
                            }));
                          }}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'tests':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Link Tests</h3>
              <p className="text-sm text-blue-700">
                Select tests that will be used to verify the specification parameters.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {tests.map(test => (
                <div
                  key={test.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    formData.linkedTestIds.includes(test.id)
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-white border-gray-200 hover:border-blue-200'
                  }`}
                  onClick={() => {
                    const newLinkedTestIds = formData.linkedTestIds.includes(test.id)
                      ? formData.linkedTestIds.filter(id => id !== test.id)
                      : [...formData.linkedTestIds, test.id];
                    
                    setFormData(prev => ({
                      ...prev,
                      linkedTestIds: newLinkedTestIds
                    }));
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900">{test.name}</h4>
                      <p className="text-sm text-gray-500">{test.type}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.linkedTestIds.includes(test.id)}
                      onChange={() => {}}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">New Specification</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          {renderStepContent()}
        </div>

        <div className="flex justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleBack}
            disabled={currentStep === 'context'}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <button
            onClick={handleNext}
            disabled={
              (currentStep === 'context' && (!formData.materialType || !formData.synthesisType)) ||
              (currentStep === 'distribution' && formData.regions.length === 0) ||
              (currentStep === 'scope' && formData.selectedParameterTypes.length === 0) ||
              (currentStep === 'parameters' && formData.parameters.length === 0) ||
              (currentStep === 'tests' && formData.linkedTestIds.length === 0)
            }
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {currentStep === 'tests' ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Create Specification
              </>
            ) : (
              <>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}