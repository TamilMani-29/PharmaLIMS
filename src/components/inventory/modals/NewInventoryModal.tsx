import React from 'react';
import { X, Upload } from 'lucide-react';
import { useInventory, ItemCategory } from '../../../context/InventoryContext';

interface NewInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: ItemCategory[] = ['Reagent', 'Solvent', 'Standard', 'Buffer'];

export default function NewInventoryModal({ isOpen, onClose }: NewInventoryModalProps) {
  const { addItem } = useInventory();
  const [formData, setFormData] = React.useState({
    name: '',
    description: '',
    itemCode: '',
    category: 'Reagent' as ItemCategory,
    casNumber: '',
    manufacturer: '',
    catalogNumber: '',
    quantity: '',
    unit: '',
    boxId: '',
    expiryDate: '',
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
    addItem({
      name: formData.name,
      description: formData.description,
      itemCode: formData.itemCode,
      category: formData.category,
      casNumber: formData.casNumber,
      manufacturer: formData.manufacturer,
      catalogNumber: formData.catalogNumber,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      status: 'In Use',
      dates: {
        received: new Date().toISOString(),
        expiry: formData.expiryDate,
      },
      location: formData.boxId ? {
        boxId: formData.boxId,
        ...boxLocations[formData.boxId as keyof typeof boxLocations]
      } : { boxId: '', rack: '', shelf: '', freezer: '', lab: '' },
      packageSize: '',
      packagingType: 'Bottle',
      lotNumber: '',
      owner: 'System',
      notes: [],
      activityLog: []
    });
    onClose();
    setFormData({
      name: '',
      description: '',
      itemCode: '',
      category: 'Reagent',
      casNumber: '',
      manufacturer: '',
      catalogNumber: '',
      quantity: '',
      unit: '',
      boxId: '',
      expiryDate: '',
      notes: ''
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Add New Inventory Item</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
          <div className="space-y-8">
            {/* Section 1: Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 border-b pb-2 mb-4">Basic Information</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter item name"
                  />
                </div>
                <div className="col-span-1">
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter item description"
                />
              </div>
            </div>

            {/* Section 2: Product Details */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 border-b pb-2 mb-4">Product Details</h3>
              <div className="grid grid-cols-2 gap-6">
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
                    placeholder="Enter code"
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
                    placeholder="Optional"
                  />
                </div>

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
                    placeholder="Enter manufacturer"
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
                    placeholder="Enter number"
                  />
                </div>
              </div>
            </div>
            
            {/* Section 3: Quantity & Storage */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 border-b pb-2 mb-4">Quantity & Storage</h3>
              <div className="grid grid-cols-2 gap-6">
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
                    placeholder="Enter amount"
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
                
                <div>
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

                <div className="col-span-1">
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
              </div>

              {/* Box Location Details */}
              {formData.boxId && (
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <label className="block text-xs text-gray-500 mb-1">Lab</label>
                      <span className="text-sm font-medium text-gray-900">
                        {boxLocations[formData.boxId as keyof typeof boxLocations].lab}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <label className="block text-xs text-gray-500 mb-1">Freezer</label>
                      <span className="text-sm font-medium text-gray-900">
                        {boxLocations[formData.boxId as keyof typeof boxLocations].freezer}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <label className="block text-xs text-gray-500 mb-1">Rack</label>
                      <span className="text-sm font-medium text-gray-900">
                        {boxLocations[formData.boxId as keyof typeof boxLocations].rack}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Add any additional notes..."
                />
              </div>

              {/* Attachments */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Attachments
                </label>
                <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                        <span>Upload files</span>
                        <input
                          type="file"
                          className="sr-only"
                          multiple
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      SDS, CoA, etc. up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-200">
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
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}