import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit2, Check, X } from 'lucide-react';
import { useSpecifications } from '../../context/SpecificationContext';
import { useTests } from '../../context/TestContext';
import OverviewTab from './tabs/OverviewTab';
import ParametersTab from './tabs/ParametersTab';
import ComplianceReportTab from './tabs/ComplianceReportTab';

export default function SpecificationDetails() {
  const { specificationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { specifications, updateSpecification } = useSpecifications();
  const { tests } = useTests();
  const [activeTab, setActiveTab] = useState<'overview' | 'parameters' | 'compliance'>('overview');
  
  // Check if we should set a specific active tab from navigation state
  React.useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);
  
  const [isEditing, setIsEditing] = useState(false);

  const spec = specifications.find(s => s.id === specificationId);
  if (!spec) return null;

  const TabButton = ({ tab, label }: { tab: typeof activeTab; label: string }) => (
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
              const productId = location.pathname.split('/')[2];
              navigate(`/products/${productId}`);
            }}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {spec.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {spec.id} - Version {spec.version}
            </p>
          </div>
        </div>
        {/* <div className="flex items-center space-x-2"> */}
          {/* {isEditing ? (
            <>
              <button
                onClick={() => {
                  // Handle save
                  setIsEditing(false);
                }}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Check className="w-5 h-5 mr-2" />
                Save
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                <X className="w-5 h-5 mr-2" />
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Edit2 className="w-5 h-5 mr-2" />
              Edit Specification
            </button>
          )} */}
        {/* </div> */}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex space-x-2">
            <TabButton tab="overview" label="Overview" />
            <TabButton tab="parameters" label="Parameters" />
            <TabButton tab="compliance" label="Compliance" />
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <OverviewTab specification={spec} />
          )}

          {activeTab === 'parameters' && <ParametersTab specificationId={spec.id} />}

          {activeTab === 'compliance' && (
            <ComplianceReportTab specificationId={spec.id} />
          )}
        </div>
      </div>
    </div>
  );
}