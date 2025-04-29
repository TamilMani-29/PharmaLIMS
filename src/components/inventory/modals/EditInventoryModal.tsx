import React from 'react';
import { X, Upload } from 'lucide-react';
import { useInventory, ItemCategory, InventoryItem } from '../../../context/InventoryContext';

interface EditInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem;
}

const CATEGORIES: ItemCategory[] = ['Reagent', 'Solvent', 'Standard', 'Buffer'];

export default function EditInventoryModal({ isOpen, onClose, item }: EditInventoryModalProps) {
  const { updateItem } = useInventory();
  const [formData, setFormData] = React.useState({
    name: item.name,
    description: item.description || '',
    itemCode: item.itemCode,
    category: item.category,
    casNumber: item.casNumber || '',
    manufacturer: item.manufacturer,
    catalogNumber: item.catalogNumber,
    quantity: item.quantity.toString(),
    unit: item.unit,
    boxId: item.location?.boxId || '',
    expiryDate: item.dates.expiry,
    notes: ''
  });

  const boxLocations = {
    'box1': {
      drawer: 'D1',
      rack: 'R1',
      shelf: 'S1',
      freezer: 'F1',
      lab: 'Lab 1'
    },
    'box2': {
      drawer: 'D2',
      rack: 'R2',
      shelf: 'S2',
      freezer: 'F2',
      lab: 'Lab 2'
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateItem(item.id, {
      ...item,
      name: formData.name,
      description: formData.description,
      itemCode: formData.itemCode,
      category: formData.category,
      casNumber: formData.casNumber,
      manufacturer: formData.manufacturer,
      catalogNumber: formData.catalogNumber,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      location: formData.boxId ? {
        boxId: formData.boxId,
        ...boxLocations[formData.boxId as keyof typeof boxLocations]
      } : { boxId: '', drawer: '', rack: '', shelf: '', freezer: '', lab: '' },
      dates: {
        ...item.dates,
        expiry: formData.expiryDate
      }
    });
    onClose();
  };

  if (!isOpen) return null;

  const selectedBoxLocation = formData.boxId ? boxLocations[formData.boxId as keyof typeof boxLocations] : null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Edit Inventory Item</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="grid grid-cols-2 gap-6">
            {/* Basic Information */}
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="mL, g, etc."
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as ItemCategory }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {CATEGORIES.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Code
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.itemCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, itemCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    CAS Number
                  </label>
                  <input
                    type="text"
                    value={formData.casNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, casNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.manufacturer}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Catalog Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.catalogNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, catalogNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date
                </label>
                <input
                  type="date"
                  required
                  value={formData.expiryDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Storage Location */}
            <div className="col-span-2">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Storage Location
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-1">
                      Box ID
                    </label>
                    <select
                      value={formData.boxId}
                      onChange={(e) => setFormData(prev => ({ ...prev, boxId: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select box...</option>
                      <option value="box1">Box A1</option>
                      <option value="box2">Box A2</option>
                    </select>
                  </div>
                </div>

                {selectedBoxLocation && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <label className="block text-xs text-gray-500 mb-1">Lab</label>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedBoxLocation.lab}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <label className="block text-xs text-gray-500 mb-1">Freezer</label>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedBoxLocation.freezer}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <label className="block text-xs text-gray-500 mb-1">Rack</label>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedBoxLocation.rack}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}