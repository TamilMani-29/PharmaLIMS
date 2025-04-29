import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTests } from '../../context/TestContext';
import { useSpecifications } from '../../context/SpecificationContext';
import OverviewTab from './tabs/OverviewTab';
import TestInstructionsTab from './tabs/TestInstructionsTab';
import SamplesTab from './tabs/SamplesTab';
import ResourcesTab from './tabs/ResourcesTab';

export default function TestDetails() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { tests } = useTests();
  const { specifications } = useSpecifications();
  const [activeTab, setActiveTab] = useState<'overview' | 'instructions' | 'samples' | 'resources'>('overview');
  
  // Check where we came from
  const isFromSample = location.state?.fromSample;
  const sampleId = location.state?.sampleId;
  
  // Check if we came from the test master page
  const isFromTestMaster = location.state?.fromTestMaster === true;
  
  // If we're coming from test master, only show overview and instructions tabs
  useEffect(() => {
    if (isFromTestMaster && (activeTab === 'samples' || activeTab === 'resources')) {
      setActiveTab('overview');
    }
  }, [isFromTestMaster, activeTab]);

  const test = tests.find(t => t.id === testId);
  if (!test) return null;

  // Get linked specification and parameter if they exist
  const linkedSpecification = test.specificationId ? 
    specifications.find(spec => spec.id === test.specificationId) : null;
  
  const linkedParameter = linkedSpecification && test.parameterId ? 
    linkedSpecification.parameters.find(param => param.id === test.parameterId) : null;

  // Check if we came from a specification page
  const isFromSpecification = location.state?.from === 'specification';
  const specificationId = location.state?.specificationId;

  const TabButton = ({ tab, label }: { tab: 'overview' | 'instructions' | 'samples' | 'resources'; label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`px-4 py-2 text-sm font-medium rounded-lg ${
        activeTab === tab
          ? 'bg-blue-50 text-blue-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => {
              // Extract productId from the current path
              const productId = location.pathname.split('/')[2];
              if (isFromSample && sampleId) {
                navigate(`/products/${productId}/samples/${sampleId}`);
              } else if (isFromSpecification && specificationId) {
                navigate(`/products/${productId}/specifications/${specificationId}`);
              } else {
                navigate(`/products/${productId}`);
              }
            }}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {test.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">{test.id} - {test.type}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-2">
            {/* Specification and Parameter Info */}
            {linkedSpecification && linkedParameter && (
              <div className="flex-1 flex items-center mr-4">
                <div className="bg-blue-50 px-3 py-1 rounded-lg text-sm">
                  <span className="font-medium text-blue-800">{linkedSpecification.name}</span>
                  <span className="mx-2 text-blue-400">•</span>
                  <span className="text-blue-700">{linkedParameter.id} - {linkedParameter.name}: {linkedParameter.expectedValue} {linkedParameter.unit}</span>
                </div>
              </div>
            )}
            
            <TabButton tab="overview" label="Overview" />
            <TabButton tab="instructions" label="Instructions" />
            {!isFromTestMaster && (
              <>
                <TabButton tab="samples" label="Samples" />
                <TabButton tab="resources" label="Resources" />
              </>
            )}
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab 
              test={test}
              isFromTestMaster={isFromTestMaster} 
            />
          )}
          
          {activeTab === 'instructions' && (
            <TestInstructionsTab
              test={test}
              parameter={linkedParameter}
              isFromTestMaster={isFromTestMaster}
            />
          )}

          {!isFromTestMaster && activeTab === 'samples' && (
            <SamplesTab test={test} />
          )}

          {!isFromTestMaster && activeTab === 'resources' && (
            <ResourcesTab test={test} />
          )}
        </div>
      </div>
    </div>
  );
}