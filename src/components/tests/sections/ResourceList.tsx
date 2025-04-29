import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { TestResource } from '../../../context/TestContext';

interface ResourceListProps {
  title: string;
  resources: TestResource[];
}

export default function ResourceList({ title, resources }: ResourceListProps) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-700 mb-4">{title}</h3>
      {resources.length === 0 ? (
        <p className="text-sm text-gray-500">No {title.toLowerCase()} assigned</p>
      ) : (
        <div className="space-y-3">
          {resources.map((resource) => (
            <div
              key={resource.id}
              className="bg-white rounded-lg p-3 shadow-sm flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {resource.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {resource.id}
                  </div>
                </div>
              </div>

              {resource.type === 'inventory' && resource.quantity !== undefined && (
                <div className="flex items-center">
                  {resource.quantity <= 20 && (
                    <div className="flex items-center text-yellow-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      Low stock
                    </div>
                  )}
                </div>
              )}

              {resource.type === 'equipment' && resource.assignedTime && (
                <div className="text-sm text-gray-500">
                  {new Date(resource.assignedTime.start).toLocaleTimeString()} - 
                  {new Date(resource.assignedTime.end).toLocaleTimeString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}