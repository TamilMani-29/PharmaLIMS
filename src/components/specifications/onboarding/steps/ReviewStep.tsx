import React from 'react';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { SpecificationType } from '../../../../context/SpecificationContext';

interface ReviewStepProps {
  generatedSpecs: Array<{
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
  }>;
  productName: string;
}

export default function ReviewStep({ generatedSpecs, productName }: ReviewStepProps) {
  const [editingSpec, setEditingSpec] = React.useState<number | null>(null);
  const [editedSpecs, setEditedSpecs] = React.useState(generatedSpecs);
  
  const handleSpecEdit = (index: number) => {
    setEditingSpec(index);
  };
  
  const handleSpecSave = () => {
    setEditingSpec(null);
  };
  
  const updateSpecName = (index: number, name: string) => {
    const updatedSpecs = [...editedSpecs];
    updatedSpecs[index] = {...updatedSpecs[index], name};
    setEditedSpecs(updatedSpecs);
  };
  
  const updateSpecDescription = (index: number, description: string) => {
    const updatedSpecs = [...editedSpecs];
    updatedSpecs[index] = {...updatedSpecs[index], description};
    setEditedSpecs(updatedSpecs);
  };
  
  const updateParameter = (specIndex: number, paramIndex: number, field: string, value: string) => {
    const updatedSpecs = [...editedSpecs];
    updatedSpecs[specIndex].parameters[paramIndex] = {
      ...updatedSpecs[specIndex].parameters[paramIndex],
      [field]: value
    };
    setEditedSpecs(updatedSpecs);
  };

  const addParameter = (specIndex: number) => {
    const updatedSpecs = [...editedSpecs];
    updatedSpecs[specIndex].parameters.push({
      name: 'New Parameter',
      type: 'Physical',
      unit: '',
      expectedValue: '',
      testMethod: '',
      mandatory: false
    });
    setEditedSpecs(updatedSpecs);
  };
  
  const deleteParameter = (specIndex: number, paramIndex: number) => {
    const updatedSpecs = [...editedSpecs];
    updatedSpecs[specIndex].parameters.splice(paramIndex, 1);
    setEditedSpecs(updatedSpecs);
  };
  
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-green-900 mb-2">Generated Specifications</h3>
        <p className="text-sm text-green-700 mb-4">
          Based on your selections, the following specifications will be created:
        </p>
        <div className="space-y-4">
          {editedSpecs.map((spec, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-green-100">
              <div className="flex justify-between items-center mb-2">
                {editingSpec === index ? (
                  <input
                    type="text"
                    value={spec.name}
                    onChange={(e) => updateSpecName(index, e.target.value)}
                    className="font-medium text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full"
                  />
                ) : (
                  <h4 className="font-medium text-gray-900">{spec.name}</h4>
                )}
                
                {editingSpec === index ? (
                  <button onClick={handleSpecSave} className="text-green-600 hover:text-green-700">
                    <Save className="w-4 h-4" />
                  </button>
                ) : (
                  <button onClick={() => handleSpecEdit(index)} className="text-blue-600 hover:text-blue-700">
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {editingSpec === index ? (
                <textarea
                  value={spec.description}
                  onChange={(e) => updateSpecDescription(index, e.target.value)}
                  className="text-sm text-gray-500 mb-2 w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              ) : (
                <p className="text-sm text-gray-500 mb-2">{spec.description}</p>
              )}
              
              <div className="mt-2">
                <h5 className="text-sm font-medium text-gray-700 mb-1">Parameters:</h5>
                <div className="flex justify-end mb-2">
                  <button 
                    onClick={() => addParameter(index)}
                    className="flex items-center px-2 py-1 text-xs font-medium text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    Add Parameter
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expected Value</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Test Method</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mandatory</th>
                        <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {spec.parameters.map((param, pIndex) => (
                        <tr key={pIndex}>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              value={param.name}
                              onChange={(e) => updateParameter(index, pIndex, 'name', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <select
                              value={param.type}
                              onChange={(e) => updateParameter(index, pIndex, 'type', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="Physical">Physical</option>
                              <option value="Chemical">Chemical</option>
                              <option value="Microbial">Microbial</option>
                              <option value="Performance">Performance</option>
                              <option value="Stability">Stability</option>
                              <option value="Other">Other</option>
                            </select>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              value={param.unit}
                              onChange={(e) => updateParameter(index, pIndex, 'unit', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              value={param.expectedValue}
                              onChange={(e) => updateParameter(index, pIndex, 'expectedValue', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="text"
                              value={param.testMethod || ''}
                              onChange={(e) => updateParameter(index, pIndex, 'testMethod', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={param.mandatory}
                              onChange={(e) => updateParameter(index, pIndex, 'mandatory', e.target.checked.toString())}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <button 
                              onClick={() => deleteParameter(index, pIndex)} 
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
        <h3 className="text-sm font-medium text-yellow-900 mb-2">Important Notes</h3>
        <ul className="space-y-2 text-sm text-yellow-800">
          <li>• All acceptance criteria must be justified by data from batches used in clinical and/or stability studies</li>
          <li>• Consider process capability and analytical method variability when setting limits</li>
          <li>• For impurity limits, refer to ICH Q3A/B thresholds based on maximum daily dose</li>
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-900 mb-2">Next Steps</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start">
            <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 mr-2 flex-shrink-0">1</span>
            <span>Review and finalize the generated specifications</span>
          </li>
          <li className="flex items-start">
            <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 mr-2 flex-shrink-0">2</span>
            <span>Link tests to parameters to verify acceptance criteria</span>
          </li>
          <li className="flex items-start">
            <span className="w-5 h-5 bg-blue-200 rounded-full flex items-center justify-center text-blue-800 mr-2 flex-shrink-0">3</span>
            <span>Schedule testing activities and assign resources</span>
          </li>
        </ul>
      </div>
    </div>
  );
}