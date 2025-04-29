import React from 'react';
import { useTests } from '../../../context/TestContext';
import { useNavigate } from 'react-router-dom';
import { Clock, CheckCircle2, XCircle, AlertCircle, FileText, Beaker, CheckCircle } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function KanbanOverview() {
  const { tests } = useTests();
  const navigate = useNavigate();
  const location = useLocation();
  const productId = location.pathname.split('/')[2];

  // Group tests by status
  const scheduledTests = tests.filter(test => test.status === 'Not Started');
  const inProgressTests = tests.filter(test => test.status === 'In Progress');
  const completedTests = tests.filter(test => test.status === 'Completed');
  const reviewedTests = tests.filter(test => 
    test.status === 'Completed' && 
    test.samples.every(sample => sample.resultStatus === 'Pass' || sample.resultStatus === 'Fail')
  );

  const stages = [
    { 
      id: 'scheduled', 
      name: 'Scheduled', 
      count: scheduledTests.length, 
      icon: <Clock className="w-4 h-4 text-gray-500" />,
      color: 'bg-gray-100'
    },
    { 
      id: 'in-progress', 
      name: 'In Progress', 
      count: inProgressTests.length, 
      icon: <AlertCircle className="w-4 h-4 text-blue-500" />,
      color: 'bg-blue-100'
    },
    { 
      id: 'completed', 
      name: 'Completed', 
      count: completedTests.length, 
      icon: <CheckCircle className="w-4 h-4 text-green-500" />,
      color: 'bg-green-100'
    },
    { 
      id: 'reviewed', 
      name: 'Reviewed', 
      count: reviewedTests.length, 
      icon: <FileText className="w-4 h-4 text-purple-500" />,
      color: 'bg-purple-100'
    }
  ];

  const totalTests = stages.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="text-xs text-gray-500">
          {totalTests} total tests
        </div>
      </div>

      <div className="flex space-x-2">
        {stages.map((stage) => (
          <div 
            className="flex-1"
          >
            <div className={`${stage.color} rounded-lg p-3 transition-all`}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  {stage.icon}
                  <span className="ml-2 text-sm font-medium text-gray-900">{stage.name}</span>
                </div>
                <span className="px-1.5 py-0.5 bg-white rounded-full text-xs font-medium text-gray-700">
                  {stage.count}
                </span>
              </div>
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      stage.id === 'scheduled' ? 'bg-gray-500' :
                      stage.id === 'in-progress' ? 'bg-blue-500' :
                      stage.id === 'completed' ? 'bg-green-500' :
                      'bg-purple-500'
                    }`}
                    style={{ width: `${totalTests ? (stage.count / totalTests) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Tests */}
      <div className="mt-3">
        <h3 className="text-xs font-medium text-gray-700 mb-1">Recent Tests</h3>
        <div className="space-y-2">
          {tests.slice(0, 3).map(test => (
            <div 
              key={test.id}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                {test.status === 'Not Started' ? (
                  <Clock className="w-4 h-4 text-gray-500 mr-2" />
                ) : test.status === 'In Progress' ? (
                  <AlertCircle className="w-4 h-4 text-blue-500 mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                )}
                <div>
                  <p className="text-xs font-medium text-gray-900">{test.name}</p>
                  <div className="flex flex-col text-xs text-gray-500">
                    <span>{test.id} • {test.samples.length} samples</span>
                    {test.assignedTo && (
                      <span>Assigned: {test.assignedTo}</span>
                    )}
                    {test.dueDate && (
                      <span className="flex items-center">
                        Due: {new Date(test.dueDate).toLocaleDateString()}
                        {new Date(test.dueDate) < new Date() && test.status !== 'Completed' && (
                          <span className="ml-1 px-1 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                            Overdue
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                test.status === 'Not Started' ? 'bg-gray-100 text-gray-800' :
                test.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                'bg-green-100 text-green-800'
              }`}>
                {test.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}