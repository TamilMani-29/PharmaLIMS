import React, { useState } from 'react';
import { X, Search, Plus } from 'lucide-react';
import { Test, TestResource } from '../../../context/TestContext';
import { useTests } from '../../../context/TestContext';
import { useEquipment } from '../../../context/EquipmentContext';
import { useInventory } from '../../../context/InventoryContext';

interface EditResourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
  test: Test;
}

export default function EditResourcesModal({ isOpen, onClose, test }: EditResourcesModalProps) {
  const { updateTest } = useTests();
  const { equipment } = useEquipment();
  const { items } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const handleRemoveResource = (resourceId: string) => {
    const updatedResources = test.resources.filter(r => r.id !== resourceId);
    updateTest(test.id, { resources: updatedResources });
  };

  const handleAddResource = (resource: TestResource) => {
    const updatedResources = [...test.resources, resource];
    updateTest(test.id, { resources: updatedResources });
  };

  const availableEquipment = equipment.filter(item => 
    !test.resources.some(r => r.id === item.id) &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const availableInventory = items.filter(item =>
    !test.resources.some(r => r.id === item.id) &&
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Edit Resources</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search resources..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-6">
            {/* Current Resources */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Current Resources</h3>
              <div className="space-y-2">
                {test.resources.map(resource => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">{resource.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({resource.type})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveResource(resource.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Available Equipment */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Available Equipment</h3>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                {availableEquipment.map(item => (
                  <div
                    key={item.id}
                    className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAddResource({
                      id: item.id,
                      type: 'equipment',
                      name: item.name
                    })}
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({item.id})</span>
                    </div>
                    <Plus className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>

            {/* Available Inventory */}
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Available Inventory</h3>
              <div className="border border-gray-200 rounded-lg divide-y divide-gray-200">
                {availableInventory.map(item => (
                  <div
                    key={item.id}
                    className="p-3 flex items-center justify-between hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAddResource({
                      id: item.id,
                      type: 'inventory',
                      name: item.name
                    })}
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      <span className="text-sm text-gray-500 ml-2">({item.id})</span>
                    </div>
                    <Plus className="w-4 h-4 text-gray-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}