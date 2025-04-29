import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpecifications } from '../../../context/SpecificationContext';
import { useTests } from '../../../context/TestContext';
import { CheckCircle, XCircle, AlertTriangle, Eye } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function ComplianceSummary() {
  const navigate = useNavigate();
  const location = useLocation();
  const productId = location.pathname.split('/')[2];
  const { specifications } = useSpecifications();
  const { tests } = useTests();

  // Calculate compliance statistics
  const specResults = specifications.map(spec => {
    // Get all linked tests for this specification
    const linkedTests = tests.filter(test => spec.linkedTestIds.includes(test.id));
    const completedTests = linkedTests.filter(test => test.status === 'Completed');
    
    // Calculate results for parameters
    const parameterResults = spec.parameters.map(param => {
      // Get linked tests for this parameter
      const paramLinkedTestIds = param.linkedTestIds || [];
      
      // If parameter has specific linked tests, use those, otherwise use all linked tests
      const relevantTestIds = paramLinkedTestIds.length > 0 
        ? paramLinkedTestIds 
        : spec.linkedTestIds;
      
      // Check if all relevant tests are completed
      const allTestsCompleted = relevantTestIds.every(testId => {
        const test = tests.find(t => t.id === testId);
        return test && test.status === 'Completed';
      });
      
      if (!allTestsCompleted) {
        return { status: 'Pending' };
      }
      
      // Mock result - in a real app, you would extract actual test values
      // For demo purposes, we'll randomly determine pass/fail with 80% pass rate
      return { status: Math.random() > 0.2 ? 'Pass' : 'Fail' };
    });
    
    const passingCount = parameterResults.filter(r => r.status === 'Pass').length;
    const failingCount = parameterResults.filter(r => r.status === 'Fail').length;
    const pendingCount = parameterResults.filter(r => r.status === 'Pending').length;
    
    // Determine overall status
    let status;
    if (failingCount > 0) {
      status = 'Failing';
    } else if (pendingCount > 0) {
      status = 'In Progress';
    } else {
      status = 'Passing';
    }

    return {
      id: spec.id,
      name: spec.name,
      regions: spec.regions,
      status,
      passingCount,
      failingCount,
      pendingCount,
      totalParameters: spec.parameters.length
    };
  }).filter(Boolean);

  // Calculate totals
  const totalSpecs = specResults.length;
  const passingSpecs = specResults.filter(spec => spec.status === 'Passing').length;
  const failingSpecs = specResults.filter(spec => spec.status === 'Failing').length;
  const inProgressSpecs = specResults.filter(spec => spec.status === 'In Progress').length;

  // Get recently failed specifications
  const recentlyFailedSpecs = specResults
    .filter(spec => spec.status === 'Failing')
    .slice(0, 3);

  return (
    <div>
      {/* Region Filter */}
      <div className="mb-2">
        <span className="text-xs text-gray-500">
          {totalSpecs} specifications
        </span>
      </div>

      {/* Compliance Chart */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-700">Passing ({passingSpecs})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-700">Failing ({failingSpecs})</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
              <span className="text-xs text-gray-700">In Progress ({inProgressSpecs})</span>
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {Math.round((passingSpecs / totalSpecs) * 100) || 0}% passing
          </div>
        </div>
        
        {/* Stacked Bar Chart */}
        <div className="w-full h-8 bg-gray-200 rounded-full overflow-hidden">
          <div className="flex h-full">
            <div 
              className="bg-green-500 h-full"
              style={{ width: `${totalSpecs ? (passingSpecs / totalSpecs) * 100 : 0}%` }}
            ></div>
            <div 
              className="bg-red-500 h-full"
              style={{ width: `${totalSpecs ? (failingSpecs / totalSpecs) * 100 : 0}%` }}
            ></div>
            <div 
              className="bg-yellow-500 h-full"
              style={{ width: `${totalSpecs ? (inProgressSpecs / totalSpecs) * 100 : 0}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Recently Failed Specifications */}
      <div>
        <h3 className="text-xs font-medium text-gray-700 mb-2">Recently Failed Specifications</h3>
        {recentlyFailedSpecs.length > 0 ? (
          <div className="space-y-3">
            {recentlyFailedSpecs.map(spec => (
              <div 
                key={spec.id}
                className="flex items-center justify-between p-2 bg-red-50 rounded-lg"
              >
                <div className="flex items-center">
                  <XCircle className="w-5 h-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-xs font-medium text-gray-900">{spec.name}</p>
                    <div className="flex items-center mt-1">
                      <span className="text-xs text-gray-500">
                        {spec.passingCount}/{spec.totalParameters} parameters passing
                      </span>
                      <span className="mx-2 text-gray-300">•</span>
                      <span className="text-xs text-gray-500">
                        {spec.regions.join(', ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500">No failed specifications</p>
          </div>
        )}
      </div>
    </div>
  );
}