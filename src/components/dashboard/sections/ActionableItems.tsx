import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTests } from '../../../context/TestContext';
import { useSamples } from '../../../context/SampleContext';
import { useInventory } from '../../../context/InventoryContext';
import { useSpecifications } from '../../../context/SpecificationContext';
import { 
  Clock, 
  AlertTriangle, 
  TestTube2, 
  Beaker, 
  ClipboardList, 
  FileText, 
  ChevronRight 
} from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function ActionableItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const productId = location.pathname.split('/')[2];
  const { tests } = useTests();
  const { samples } = useSamples();
  const { items } = useInventory();
  const { specifications } = useSpecifications();

  // Generate actionable items
  const actionItems = [
    // Tests awaiting result entry
    ...tests
      .filter(test => 
        test.status === 'In Progress' && 
        test.samples.some(sample => sample.status === 'In Progress' && !sample.results)
      )
      .map(test => ({
        id: `test-${test.id}`,
        title: 'Test Awaiting Results',
        description: `Enter results for ${test.name}`,
        assignedTo: test.assignedTo,
        dueDate: test.dueDate,
        icon: <Beaker className="w-5 h-5 text-blue-500" />,
        severity: 'medium',
        action: () => navigate(`/products/${productId}/tests/${test.id}`)
      })),
    
    // Pending sample registrations
    ...samples
      .filter(sample => sample.status === 'submitted' && sample.aliquots.length === 0)
      .map(sample => ({
        id: `sample-${sample.id}`,
        title: 'Sample Needs Processing',
        description: `Create aliquots for ${sample.name}`,
        icon: <TestTube2 className="w-5 h-5 text-purple-500" />,
        severity: 'high',
        action: () => navigate(`/products/${productId}/samples/${sample.id}`)
      })),
    
    // Specs with failed tests
    ...specifications
      .filter(spec => {
        const linkedTests = tests.filter(test => spec.linkedTestIds.includes(test.id));
        return linkedTests.some(test => 
          test.samples.some(sample => sample.resultStatus === 'Fail')
        );
      })
      .map(spec => ({
        id: `spec-${spec.id}`,
        title: 'Failed Specification',
        description: `Review failed tests for ${spec.name}`,
        icon: <ClipboardList className="w-5 h-5 text-red-500" />,
        severity: 'critical',
        action: () => navigate(`/products/${productId}/specifications/${spec.id}`)
      })),
    
    // Unlinked parameters
    ...specifications
      .flatMap(spec => 
        spec.parameters
          .filter(param => !param.linkedTestIds || param.linkedTestIds.length === 0)
          .map(param => ({
            id: `param-${spec.id}-${param.id}`,
            title: 'Unlinked Parameter',
            description: `Link tests to parameter ${param.name}`,
            icon: <FileText className="w-5 h-5 text-yellow-500" />,
            severity: 'low',
            action: () => navigate(`/products/${productId}/specifications/${spec.id}`, { state: { activeTab: 'parameters' } })
          }))
      )
  ];

  // Sort by severity
  const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  actionItems.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto">
      {actionItems.length > 0 ? (
        actionItems.map(item => (
          <div 
            key={item.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0 mr-3">
                {item.icon}
              </div>
              <div>
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(item.severity)}`}>
                    {item.severity}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                {item.dueDate && (
                  <p className="text-xs text-gray-500 mt-1">
                    Due: {new Date(item.dueDate).toLocaleDateString()}
                    {new Date(item.dueDate) < new Date() && (
                      <span className="ml-1 px-1 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                        Overdue
                      </span>
                    )}
                  </p>
                )}
                {item.assignedTo && (
                  <p className="text-xs text-gray-500 mt-1">
                    Assigned to: {item.assignedTo}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))
      ) : (
        <div className="text-center py-6 bg-gray-50 rounded-lg">
          <Clock className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No action items</p>
        </div>
      )}
    </div>
  );
}