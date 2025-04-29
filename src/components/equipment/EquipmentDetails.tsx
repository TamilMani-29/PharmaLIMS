import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Edit2, Download, Upload, AlertTriangle, Clock, Check, X } from 'lucide-react';
import { useEquipment } from '../../context/EquipmentContext';

export default function EquipmentDetails() {
  const { equipmentId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { equipment, updateEquipment, addMaintenanceRecord, addNote } = useEquipment();
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: '',
    model: '',
    manufacturer: '',
    serialNumber: '',
    location: '',
    status: '',
    calibration: {
      lastDate: '',
      nextDate: '',
      calibratedBy: ''
    }
  });

  const item = equipment.find(e => e.id === equipmentId);
  if (!item) return null;

  React.useEffect(() => {
    if (item) {
      setFormData({
        name: item.name,
        description: item.description,
        type: item.type,
        model: item.model,
        manufacturer: item.manufacturer,
        serialNumber: item.serialNumber,
        location: item.location,
        status: item.status,
        calibration: { ...item.calibration }
      });
    }
  }, [item]);

  const handleSave = () => {
    updateEquipment(item.id, formData);
    setIsEditing(false);
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      addNote(item.id, newNote, 'John Doe');
      setNewNote('');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Available':
        return 'bg-green-100 text-green-800';
      case 'In Use':
        return 'bg-blue-100 text-blue-800';
      case 'Under Maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'Out of Service':
        return 'bg-red-100 text-red-800';
      case 'Quarantined':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const daysUntilCalibration = Math.ceil(
    (new Date(item.calibration.nextDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

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
            <h1 className="text-2xl font-semibold text-gray-900">
              {item.name}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {item.id} - {item.type}
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
                onClick={() => setIsEditing(false)}
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
              Edit Equipment
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="col-span-2 space-y-6">
          {/* Basic Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Equipment Details</h2>
            <div className="grid grid-cols-2 gap-6">
              <div className="col-span-2">
                <label className="block text-sm text-gray-500">Description</label>
                {isEditing ? (
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Enter equipment description..."
                  />
                ) : (
                  <p className="text-sm text-gray-900">{item.description}</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-500">Model</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{item.model}</span>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-500">Serial Number</label>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, serialNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <span className="text-sm font-medium text-gray-900">{item.serialNumber}</span>
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
                <label className="block text-sm text-gray-500">Location</label>
                {isEditing ? (
                  <select
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Lab 1">Lab 1</option>
                    <option value="Lab 2">Lab 2</option>
                    <option value="Lab 3">Lab 3</option>
                    <option value="Lab 4">Lab 4</option>
                    <option value="Lab 5">Lab 5</option>
                  </select>
                ) : (
                  <span className="text-sm font-medium text-gray-900">{item.location}</span>
                )}
              </div>
            </div>
          </div>

          {/* Calibration Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Calibration Information</h2>
            <div className="space-y-6">
              {/* Calibration Dates */}
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Last Calibration</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={formData.calibration.lastDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        calibration: { ...prev.calibration, lastDate: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(item.calibration.lastDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Next Calibration</label>
                  <div className="flex items-center">
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.calibration.nextDate}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          calibration: { ...prev.calibration, nextDate: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm font-medium text-gray-900">
                        {new Date(item.calibration.nextDate).toLocaleDateString()}
                      </span>
                    )}
                    {daysUntilCalibration <= 7 && (
                      <AlertTriangle className="w-4 h-4 ml-2 text-yellow-500" />
                    )}
                  </div>
                  {daysUntilCalibration <= 7 && (
                    <p className="text-sm text-yellow-600 mt-1">
                      Due in {daysUntilCalibration} days
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-2">Calibrated By</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.calibration.calibratedBy}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        calibration: { ...prev.calibration, calibratedBy: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-900">{item.calibration.calibratedBy}</span>
                  )}
                </div>
              </div>
              
              {/* Calibration Certificate */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-700">Calibration Certificate</h3>
                  <button className="text-blue-600 hover:text-blue-700">
                    <Upload className="w-5 h-5" />
                  </button>
                </div>
                {item.calibration.certificate ? (
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-900">
                      Current Certificate
                    </span>
                    <button className="text-blue-600 hover:text-blue-700">
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                          <span>Upload certificate</span>
                          <input
                            type="file"
                            className="sr-only"
                            accept=".pdf,.jpg,.jpeg,.png"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PDF, PNG, JPG up to 10MB
                      </p>
                    </div>
                  </div>
                )}
                </div>
              </div>
          </div>

          {/* Maintenance History */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Maintenance History</h2>
            <div className="space-y-4">
              {item.maintenanceHistory.map((record) => (
                <div key={record.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">{record.task}</span>
                      <span className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-600">Performed by: {record.performedBy}</p>
                    {record.notes && (
                      <p className="mt-1 text-sm text-gray-600">{record.notes}</p>
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
                <label className="block text-sm text-gray-500 mb-1">Current Status</label>
                {isEditing ? (
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Available">Available</option>
                    <option value="In Use">In Use</option>
                    <option value="Under Maintenance">Under Maintenance</option>
                    <option value="Out of Service">Out of Service</option>
                    <option value="Quarantined">Quarantined</option>
                  </select>
                ) : (
                  <span className={`px-2 py-1 inline-flex text-sm font-semibold rounded-full ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
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
              {item.notes.map((note) => (
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
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Add a note..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <button
                onClick={handleAddNote}
                className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Add Note
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}