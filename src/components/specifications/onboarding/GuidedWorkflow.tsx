import React, { useState } from 'react';
import { X, ChevronRight, ChevronDown, Check, ChevronUp } from 'lucide-react';
import { useSpecifications, SpecificationStatus, SpecificationType } from '../../../context/SpecificationContext';
import { useTests, Test } from '../../../context/TestContext';
import { useProducts } from '../../../context/ProductContext';
import MaterialTypeStep from './steps/MaterialTypeStep';
import RegionsStep from './steps/RegionsStep';
import ParameterTypesStep from './steps/ParameterTypesStep';
import ReviewStep from './steps/ReviewStep';
import LinkTestsStep from './steps/LinkTestsStep';

// Define the material and synthesis types
export const MATERIAL_TYPES = [
  { id: 'drug_substance', name: 'Drug Substance (API)' },
  { id: 'drug_product', name: 'Drug Product' },
  { id: 'excipient', name: 'Excipient' },
  { id: 'intermediate', name: 'Intermediate' },
  { id: 'raw_material', name: 'Raw Material' }
] as const;

export const SYNTHESIS_TYPES = [
  { id: 'chemical', name: 'Chemical Synthesis' },
  { id: 'biological', name: 'Biological Process' },
  { id: 'fermentation', name: 'Fermentation' },
  { id: 'extraction', name: 'Natural Extraction' }
] as const;

type Step = 'material' | 'regions' | 'parameters' | 'review' | 'link-tests';

interface GuidedWorkflowProps {
  productId: string;
  productName: string;
  onComplete: () => void;
}

export default function GuidedWorkflow({ productId, productName, onComplete }: GuidedWorkflowProps) {
  const { addSpecification, specifications } = useSpecifications();
  const [openSection, setOpenSection] = useState<Step>('material');
  const { tests } = useTests();
  const [completedSections, setCompletedSections] = useState<Step[]>([]);
  const [formData, setFormData] = useState({
    materialType: '',
    synthesisType: '',
    version: '1.0',
    status: 'Draft' as SpecificationStatus,
    regions: [] as string[],
    regulatoryGuidelines: [] as string[],
    selectedParameterTypes: [] as SpecificationType[],
  });
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
  const [parameterTestLinks, setParameterTestLinks] = useState<Record<string, string>>({});

  const handleNext = () => {
    // Mark current section as completed
    if (!completedSections.includes(openSection)) {
      setCompletedSections(prev => [...prev, openSection]);
    }
    
    // Open next section
    switch (openSection) {
      case 'material':
        setOpenSection('regions');
        break;
      case 'regions':
        setOpenSection('parameters');
        break;
      case 'parameters':
        generateSpecifications();
        setOpenSection('review');
        break;
      case 'review':
        setOpenSection('link-tests');
        break;
      case 'review':
        handleSubmit();
        break;
    }
  };

  const generateSpecifications = () => {
    let specs: typeof generatedSpecs = [];
    let parameterIdCounter = 1;
    let specIdCounter = 1;

    const createParameter = (param: Omit<any, 'id'>) => {
      const id = `PARAM-${String(parameterIdCounter++).padStart(3, '0')}`;
      return { ...param, id };
    };

    const createSpecification = (name: string, description: string, parameters: Omit<any, 'id'>[]) => {
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
        `${productName} API Release Specification`,
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
        `${productName} API Stability Specification`,
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
        `${productName} Product Release Specification`,
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
        `${productName} Product Stability Specification`,
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
  };

  const handleSubmit = async () => {
    // Create all generated specifications
    // Get the highest existing spec ID number to ensure uniqueness
    const existingSpecNumbers = specifications.map(spec => {
      const match = spec.id.match(/SPEC-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    });
    
    let nextSpecNumber = Math.max(0, ...existingSpecNumbers) + 1;
    
    for (const spec of generatedSpecs) {
      const specId = `SPEC-${String(nextSpecNumber++).padStart(3, '0')}`;
      addSpecification({
        ...formData,
        name: spec.name, 
        description: spec.description,
        id: specId,
        parameters: spec.parameters.map(param => {
          // Find any test links for this parameter
          const paramKey = `${spec.name}-${param.name}`;
          const testId = parameterTestLinks[paramKey];
          
          return {
            ...param,
            linkedTestIds: testId ? [testId] : []
          };
        }),
        productId,
        createdBy: 'John Doe',
        linkedTestIds: Object.values(parameterTestLinks).filter(Boolean)
      });
    }
    onComplete();
  };

  const isNextDisabled = () => {
    switch (openSection) {
      case 'intro':
        return false;
      case 'material':
        return !formData.materialType || !formData.synthesisType;
      case 'regions':
        return formData.regions.length === 0;
      case 'parameters':
        return formData.selectedParameterTypes.length === 0;
      case 'review':
        return false;
      case 'link-tests':
        return false;
      default:
        return false;
    }
  };

  const isSectionCompleted = (section: Step) => {
    return completedSections.includes(section);
  };

  const canOpenSection = (section: Step) => {
    switch (section) {
      case 'material':
        return true;
      case 'regions':
        return isSectionCompleted('material') || openSection === 'regions';
      case 'parameters':
        return isSectionCompleted('regions') || openSection === 'parameters';
      case 'review':
        return isSectionCompleted('parameters') || openSection === 'review';
      case 'link-tests':
        return isSectionCompleted('review') || openSection === 'link-tests';
      default:
        return false;
    }
  };

  const getSectionStatus = (section: Step) => {
    if (isSectionCompleted(section)) {
      return "Completed";
    }
    if (openSection === section) {
      return "Current";
    }
    if (canOpenSection(section)) {
      return "Available";
    }
    return "Locked";
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl mx-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Specification - Guided Workflow</h2>
          <button onClick={onComplete} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Accordion Sections */}
          <div className="space-y-4">
            {/* Material Type Section */}
            <div className={`border rounded-lg overflow-hidden ${
              canOpenSection('material') ? 'border-gray-200' : 'border-gray-100 opacity-60'
            }`}>
              <button
                onClick={() => canOpenSection('material') && setOpenSection('material')}
                className={`w-full flex items-center justify-between p-4 text-left ${
                  !canOpenSection('material') ? 'bg-gray-100 cursor-not-allowed' :
                  isSectionCompleted('material') ? 'bg-green-50' : 
                  openSection === 'material' ? 'bg-blue-50' : 'bg-gray-50'
                }`}
                disabled={!canOpenSection('material')}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    !canOpenSection('material') ? 'bg-gray-200 text-gray-500' :
                    isSectionCompleted('material') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isSectionCompleted('material') ? <Check className="w-4 h-4" /> : '1'}
                  </div>
                  <span className="font-medium">Material Type</span>
                  {isSectionCompleted('material') && (
                    <span className="ml-3 text-sm text-gray-500">
                      {MATERIAL_TYPES.find(t => t.id === formData.materialType)?.name}, 
                      {SYNTHESIS_TYPES.find(t => t.id === formData.synthesisType)?.name}
                    </span>
                  )}
                </div>
                {openSection === 'material' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {openSection === 'material' && (
                <div className="p-4 border-t border-gray-200">
                  <MaterialTypeStep formData={formData} setFormData={setFormData} />
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleNext}
                      disabled={!formData.materialType || !formData.synthesisType}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Regions Section */}
            <div className={`border rounded-lg overflow-hidden ${
              canOpenSection('regions') ? 'border-gray-200' : 'border-gray-100 opacity-60'
            }`}>
              <button
                onClick={() => canOpenSection('regions') && setOpenSection('regions')}
                className={`w-full flex items-center justify-between p-4 text-left ${
                  !canOpenSection('regions') ? 'bg-gray-100 cursor-not-allowed' :
                  isSectionCompleted('regions') ? 'bg-green-50' : 
                  openSection === 'regions' ? 'bg-blue-50' : 'bg-gray-50'
                }`}
                disabled={!canOpenSection('regions')}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    !canOpenSection('regions') ? 'bg-gray-200 text-gray-500' :
                    isSectionCompleted('regions') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isSectionCompleted('regions') ? <Check className="w-4 h-4" /> : '2'}
                  </div>
                  <span className="font-medium">Distribution Regions</span>
                  {isSectionCompleted('regions') && formData.regions.length > 0 && (
                    <span className="ml-3 text-sm text-gray-500">
                      {formData.regions.length} regions selected
                    </span>
                  )}
                </div>
                {openSection === 'regions' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {openSection === 'regions' && (
                <div className="p-4 border-t border-gray-200">
                  <RegionsStep formData={formData} setFormData={setFormData} />
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleNext}
                      disabled={formData.regions.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Parameters Section */}
            <div className={`border rounded-lg overflow-hidden ${
              canOpenSection('parameters') ? 'border-gray-200' : 'border-gray-100 opacity-60'
            }`}>
              <button
                onClick={() => canOpenSection('parameters') && setOpenSection('parameters')}
                className={`w-full flex items-center justify-between p-4 text-left ${
                  !canOpenSection('parameters') ? 'bg-gray-100 cursor-not-allowed' :
                  isSectionCompleted('parameters') ? 'bg-green-50' : 
                  openSection === 'parameters' ? 'bg-blue-50' : 'bg-gray-50'
                }`}
                disabled={!canOpenSection('parameters')}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    !canOpenSection('parameters') ? 'bg-gray-200 text-gray-500' :
                    isSectionCompleted('parameters') ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {isSectionCompleted('parameters') ? <Check className="w-4 h-4" /> : '3'}
                  </div>
                  <span className="font-medium">Parameter Types</span>
                  {isSectionCompleted('parameters') && formData.selectedParameterTypes.length > 0 && (
                    <span className="ml-3 text-sm text-gray-500">
                      {formData.selectedParameterTypes.length} types selected
                    </span>
                  )}
                </div>
                {openSection === 'parameters' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {openSection === 'parameters' && (
                <div className="p-4 border-t border-gray-200">
                  <ParameterTypesStep 
                    formData={formData} 
                    setFormData={setFormData} 
                    materialType={formData.materialType}
                    synthesisType={formData.synthesisType}
                  />
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleNext}
                      disabled={formData.selectedParameterTypes.length === 0}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Review Section */}
            <div className={`border rounded-lg overflow-hidden ${
              canOpenSection('review') ? 'border-gray-200' : 'border-gray-100 opacity-60'
            }`}>
              <button
                onClick={() => canOpenSection('review') && setOpenSection('review')}
                className={`w-full flex items-center justify-between p-4 text-left ${
                  !canOpenSection('review') ? 'bg-gray-100 cursor-not-allowed' :
                  openSection === 'review' ? 'bg-blue-50' : 'bg-gray-50'
                }`}
                disabled={!canOpenSection('review')}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    !canOpenSection('review') ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-800'
                  }`}>
                    4
                  </div>
                  <span className="font-medium">Review & Create</span>
                </div>
                {openSection === 'review' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {openSection === 'review' && (
                <div className="p-4 border-t border-gray-200">
                  <ReviewStep generatedSpecs={generatedSpecs} productName={productName} />
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleNext}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      Next
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            {/* Link Tests Section */}
            <div className={`border rounded-lg overflow-hidden ${
              canOpenSection('link-tests') ? 'border-gray-200' : 'border-gray-100 opacity-60'
            }`}>
              <button
                onClick={() => canOpenSection('link-tests') && setOpenSection('link-tests')}
                className={`w-full flex items-center justify-between p-4 text-left ${
                  !canOpenSection('link-tests') ? 'bg-gray-100 cursor-not-allowed' :
                  openSection === 'link-tests' ? 'bg-blue-50' : 'bg-gray-50'
                }`}
                disabled={!canOpenSection('link-tests')}
              >
                <div className="flex items-center">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    !canOpenSection('link-tests') ? 'bg-gray-200 text-gray-500' : 'bg-blue-100 text-blue-800'
                  }`}>
                    5
                  </div>
                  <span className="font-medium">Link Tests</span>
                </div>
                {openSection === 'link-tests' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
              {openSection === 'link-tests' && (
                <div className="p-4 border-t border-gray-200">
                  <LinkTestsStep 
                    generatedSpecs={generatedSpecs} 
                    tests={tests}
                    parameterTestLinks={parameterTestLinks}
                    setParameterTestLinks={setParameterTestLinks}
                  />
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Create Specifications
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}