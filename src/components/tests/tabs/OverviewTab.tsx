import React, { useState, useEffect } from 'react';
import { Check, Edit2 } from 'lucide-react';
import { Test, TestType } from '../../../context/TestContext';
import { useTests } from '../../../context/TestContext';
import NotesSection from '../sections/NotesSection';

interface OverviewTabProps {
  test: Test;
  isFromTestMaster?: boolean;
}

export default function OverviewTab({ test, isFromTestMaster = false }: OverviewTabProps) {
  const { updateTest } = useTests();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    startDate: '',
    dueDate: '',
    assignedTo: ''
  });

  useEffect(() => {
    if (test && isEditing) {
      setFormData({
        name: test.name,
        type: test.type,
        description: test.description,
        startDate: test.startDate || '',
        dueDate: test.dueDate || '',
        assignedTo: test.assignedTo || ''
      });
    }
  }, [test, isEditing]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="bg-gray-50 rounded-lg p-4 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700">Test Information</h3>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex items-center text-blue-600 hover:text-blue-700"
          >
            <Edit2 className="w-4 h-4 mr-1" />
            {isEditing ? 'Cancel' : 'Edit Overview'}
          </button>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500">Type</label>
            {isEditing ? (
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as TestType }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Chemical Analysis">Chemical Analysis</option>
                <option value="Physical Testing">Physical Testing</option>
                <option value="Stability Study">Stability Study</option>
                <option value="Microbial Testing">Microbial Testing</option>
                <option value="Method Validation">Method Validation</option>
              </select>
            ) : (
              <span className="text-sm font-medium">{test.type}</span>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-500">Created Date</label>
            <span className="text-sm font-medium">
              {new Date(test.createdDate).toLocaleDateString()}
            </span>
          </div>
          <div>
            <label className="block text-xs text-gray-500">Start Date</label>
            {isEditing ? (
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <span className="text-sm font-medium">
                {test.startDate ? new Date(test.startDate).toLocaleDateString() : '-'}
              </span>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-500">Assigned To</label>
            {isEditing ? (
              <select
                value={formData.assignedTo}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedTo: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select an assignee...</option>
                <option value="Dr. Sarah Chen">Dr. Sarah Chen</option>
                <option value="Dr. Mike Johnson">Dr. Mike Johnson</option>
                <option value="Dr. Emily Taylor">Dr. Emily Taylor</option>
                <option value="Dr. James Wilson">Dr. James Wilson</option>
              </select>
            ) : (
              <div className="text-sm font-medium">
                {test.assignedTo ? (
                  <span>{test.assignedTo}</span>
                ) : (
                  <span className="text-gray-400">Not assigned</span>
                )}
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-gray-500">Due Date</label>
            {isEditing ? (
              <input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            ) : (
              <div className="text-sm font-medium">
                {test.dueDate ? (
                  <div className="flex items-center">
                    {new Date(test.dueDate).toLocaleDateString()}
                    {new Date(test.dueDate) < new Date() && test.status !== 'Completed' && (
                      <span className="ml-2 px-1.5 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                        Overdue
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-400">Not set</span>
                )}
              </div>
            )}
          </div>
          <div className="col-span-2">
            <label className="block text-xs text-gray-500">Description</label>
            {isEditing ? (
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
            ) : (
              <p className="text-sm text-gray-900 mt-1">{test.description}</p>
            )}
          </div>
        </div>
        {isEditing && (
          <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                updateTest(test.id, formData);
                setIsEditing(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              <Check className="w-4 h-4 mr-2 inline" />
              Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Status</h3>
        <div className="flex items-center space-x-4">
          <span className={`px-2 py-1 text-sm font-medium rounded-full ${getStatusColor(test.status)}`}>
            {test.status}
          </span>
          {test.status === 'In Progress' && (
            <span className="text-sm text-gray-500">
              Started {new Date(test.startDate!).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Specification Link - only show if not from test master */}
      {!isFromTestMaster && test.specificationId && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-4">Linked Specification</h3>
          <div className="text-sm text-gray-500">
            This test is linked to specification ID: {test.specificationId}
            {test.parameterId && <span> (Parameter ID: {test.parameterId})</span>}
          </div>
        </div>
      )}

      {/* Notes */}
      <NotesSection testId={test.id} notes={test.notes} />
    </div>
  );
}