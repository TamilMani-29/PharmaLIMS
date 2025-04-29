import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Test, TestStatus } from '../../../context/TestContext';
import { Clock, AlertCircle, CheckCircle, Calendar, User, Beaker } from 'lucide-react';

interface TestKanbanProps {
  tests: Test[];
  onTestClick: (testId: string) => void;
}

const TEST_STAGES: { id: TestStatus; name: string; color: string }[] = [
  {
    id: 'Not Started',
    name: 'Not Started',
    color: 'bg-gray-50 border-gray-200'
  },
  {
    id: 'In Progress',
    name: 'In Progress',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'Completed',
    name: 'Completed',
    color: 'bg-green-50 border-green-200'
  }
];

export default function TestKanban({ tests, onTestClick }: TestKanbanProps) {
  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'Not Started':
        return <Clock className="w-4 h-4 text-gray-500" />;
      case 'In Progress':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="flex h-full overflow-x-auto p-4 space-x-4">
      <div className="flex h-full overflow-x-auto p-4 space-x-4">
        {TEST_STAGES.map((stage) => (
          <div key={stage.id} className="flex-none w-80">
            <div className={`${stage.color} rounded-lg p-4 h-full flex flex-col`}>
              <h3 className="font-medium text-gray-900 mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(stage.id)}
                  <span className="ml-2">{stage.name}</span>
                </div>
                <span className="bg-white text-gray-700 text-sm px-2 py-1 rounded">
                  {tests.filter((t) => t.status === stage.id).length}
                </span>
              </h3>
              
              <div className="space-y-3 overflow-y-auto flex-1">
                {tests
                  .filter((test) => test.status === stage.id)
                  .map((test) => (
                    <div
                      key={test.id}
                      onClick={() => onTestClick(test.id)}
                      className="bg-white rounded-lg border p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    >
                              <div className="flex items-start justify-between mb-2">
                                <span className="font-medium text-gray-900">
                                  {test.name}
                                </span>
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                                  {test.id}
                                </span>
                              </div>
                              
                              <div className="text-xs text-gray-600 mb-2">
                                {test.type}
                              </div>
                              
                              <div className="flex flex-col space-y-2 mt-3">
                                {test.assignedTo && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <User className="w-3.5 h-3.5 mr-1.5" />
                                    {test.assignedTo}
                                  </div>
                                )}
                                
                                {test.dueDate && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Calendar className="w-3.5 h-3.5 mr-1.5" />
                                    {new Date(test.dueDate).toLocaleDateString()}
                                    {new Date(test.dueDate) < new Date() && test.status !== 'Completed' && (
                                      <span className="ml-1 px-1 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                                        Overdue
                                      </span>
                                    )}
                                  </div>
                                )}
                                
                                <div className="flex items-center text-xs text-gray-500">
                                  <Beaker className="w-3.5 h-3.5 mr-1.5" />
                                  {test.samples.length} samples
                                </div>
                              </div>
                              
                              {/* Progress bar */}
                              {test.samples.length > 0 && (
                                <div className="mt-3">
                                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-blue-500 rounded-full"
                                      style={{ 
                                        width: `${(test.samples.filter(s => s.status === 'Completed').length / test.samples.length) * 100}%` 
                                      }}
                                    />
                                  </div>
                                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                                    <span>Progress</span>
                                    <span>
                                      {test.samples.filter(s => s.status === 'Completed').length}/{test.samples.length}
                                    </span>
                                  </div>
                                </div>
                              )}
                    </div>
                  ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}