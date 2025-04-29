import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit2, Download, Upload, AlertTriangle, Clock, Check, X } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export default function InventoryDetails() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { items, updateItem } = useInventory();
  const [selectedBoxId, setSelectedBoxId] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    itemCode: '',
    category: '',
    casNumber: '',
    manufacturer: '',
    catalogNumber: '',
    quantity: '',
    unit: '',
    boxId: '',
    expiryDate: '',
  });

  const item = items.find(i => i.id === itemId);
  if (!item) return null;

  React.useEffect(() => {
    if (item) {
      setFormData({
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
        expiryDate: item.dates?.expiry || '',
      });
    }
  }, [item]);

  const daysUntilExpiry = item.dates?.expiry 
    ? Math.ceil((new Date(item.dates.expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const isLowStock = item.quantity <= (item.quantity * 0.2);

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

  const handleSave = () => {
    updateItem(item.id, {
      ...item,
      name: formData.name,
      description: formData.description,
      itemCode: formData.itemCode,
      category: formData.category as any,
      casNumber: formData.casNumber,
      manufacturer: formData.manufacturer,
      catalogNumber: formData.catalogNumber,
      quantity: Number(formData.quantity),
      unit: formData.unit,
      dates: {
        ...item.dates,
        expiry: formData.expiryDate
      },
      location: selectedBoxId ? Object.assign(
        { boxId: selectedBoxId },
        boxLocations[selectedBoxId as keyof typeof boxLocations]
      ) : item.location
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
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
      expiryDate: item.dates?.expiry || '',
    });
    setIsEditing(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => {
              // Extract productId from the current path
              const productId = location.pathname.split('/')[2];
              navigate(`/products/${productId}`);
            }}
            className="mr-4 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="text-2xl font-semibold text-gray-900 border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent w-full"
              />
            ) : (
              <h1 className="text-2xl font-semibold text-gray-900">
                {item.name}
              </h1>
            )}
            <p className="text-sm text-gray-500 mt-1">
              {item.id} - {item.category}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Check className="w-5 h-5 mr-2" />
                Save
              </button>
              <button
                onClick={handleCancel}
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
              Edit Item
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Item Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-500">Item Code</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.itemCode}
                    onChange={(e) => setFormData(prev => ({ ...prev, itemCode: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{item.itemCode}</span>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">CAS Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.casNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, casNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{item.casNumber || '-'}</span>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Manufacturer</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{item.manufacturer}</span>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Catalog Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.catalogNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, catalogNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{item.catalogNumber}</span>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Lot Number</label>
                <span className="text-sm font-medium text-gray-900">{item.lotNumber}</span>
              </div>
              <div>
                <label className="block text-sm text-gray-500">Package Size</label>
                <span className="text-sm font-medium text-gray-900">{item.packageSize}</span>
              </div>
            </div>
          </div>

          {/* Location Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Storage Location</h2>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Box ID
                  </label>
                  <select
                    value={selectedBoxId}
                    onChange={(e) => setSelectedBoxId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select box...</option>
                    <option value="box1">Box A1</option>
                    <option value="box2">Box A2</option>
                  </select>
                </div>
                
                {selectedBoxId && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <label className="block text-xs text-gray-500 mb-1">Lab</label>
                      <span className="text-sm font-medium text-gray-900">
                        {boxLocations[selectedBoxId as keyof typeof boxLocations].lab}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <label className="block text-xs text-gray-500 mb-1">Freezer</label>
                      <span className="text-sm font-medium text-gray-900">
                        {boxLocations[selectedBoxId as keyof typeof boxLocations].freezer}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <label className="block text-xs text-gray-500 mb-1">Rack</label>
                      <span className="text-sm font-medium text-gray-900">
                        {boxLocations[selectedBoxId as keyof typeof boxLocations].rack}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <label className="block text-xs text-gray-500 mb-1">Shelf</label>
                      <span className="text-sm font-medium text-gray-900">
                        {boxLocations[selectedBoxId as keyof typeof boxLocations].shelf}
                      </span>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-gray-200">
                      <label className="block text-xs text-gray-500 mb-1">Drawer</label>
                      <span className="text-sm font-medium text-gray-900">
                        {boxLocations[selectedBoxId as keyof typeof boxLocations].drawer}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="block text-xs text-gray-500 mb-1">Lab</label>
                  <span className="text-sm font-medium text-gray-900">{item.location?.lab}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="block text-xs text-gray-500 mb-1">Freezer</label>
                  <span className="text-sm font-medium text-gray-900">{item.location?.freezer}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="block text-xs text-gray-500 mb-1">Rack</label>
                  <span className="text-sm font-medium text-gray-900">{item.location?.rack}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="block text-xs text-gray-500 mb-1">Shelf</label>
                  <span className="text-sm font-medium text-gray-900">{item.location?.shelf}</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <label className="block text-xs text-gray-500 mb-1">Box ID</label>
                  <span className="text-sm font-medium text-gray-900">{item.location?.boxId}</span>
                </div>
                {item.location?.drawer && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="block text-xs text-gray-500 mb-1">Drawer</label>
                    <span className="text-sm font-medium text-gray-900">{item.location.drawer}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Activity Log</h2>
            <div className="space-y-4">
              {item.activityLog?.map((log) => (
                <div key={log.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{log.action}</span>
                      <span className="text-xs text-gray-500">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    {log.details && (
                      <p className="mt-1 text-sm text-gray-600">{log.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-500 mb-1">Quantity</label>
                <div className="flex items-center">
                  {isEditing ? (
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <input
                        type="text"
                        value={formData.unit}
                        onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                        className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  ) : (
                    <span className="text-xl font-medium text-gray-900">
                      {item.quantity} {item.unit}
                    </span>
                  )}
                  {isLowStock && (
                    <AlertTriangle className="w-5 h-5 ml-2 text-yellow-500" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-500 mb-1">Expiry Date</label>
                <div className="flex items-center">
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.expiryDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, expiryDate: e.target.value }))}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-xl font-medium text-gray-900">
                      {item.dates?.expiry ? new Date(item.dates.expiry).toLocaleDateString() : 'No expiry date'}
                    </span>
                  )}
                  {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
                    <AlertTriangle className="w-5 h-5 ml-2 text-yellow-500" />
                  )}
                </div>
                {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
                  <p className="text-sm text-yellow-600 mt-1">
                    Expires in {daysUntilExpiry} days
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Attachments</h2>
              <button className="text-blue-600 hover:text-blue-700">
                <Upload className="w-5 h-5" />
              </button>
            </div>
            {item.attachments?.length ? (
              <div className="space-y-3">
                {item.attachments.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="text-sm text-gray-900">{file.name}</span>
                    <button className="text-blue-600 hover:text-blue-700">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No attachments</p>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Notes</h2>
            <div className="space-y-4">
              {item.notes?.map((note) => (
                <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-900">{note.user}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(note.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{note.content}</p>
                </div>
              ))}
              <textarea
                placeholder="Add a note..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <button className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700">
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}