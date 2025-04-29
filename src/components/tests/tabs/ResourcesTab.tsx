import React, { useState } from 'react';
import { Edit2, Info, Calendar, PenTool as Tool, AlertTriangle, CheckCircle, Clock, User, MapPin, Tag, Cpu, Search } from 'lucide-react';
import { Test } from '../../../context/TestContext';
import ResourceList from '../sections/ResourceList';
import EditResourcesModal from '../modals/EditResourcesModal';
import { useEquipment } from '../../../context/EquipmentContext';
import { useInventory } from '../../../context/InventoryContext';

interface ResourcesTabProps {
  test: Test;
}

export default function ResourcesTab({ test }: ResourcesTabProps) {
  const [isEditingResources, setIsEditingResources] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const { equipment } = useEquipment();
  const { items } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Get detailed equipment information
  const equipmentResources = test.resources.filter(r => r.type === 'equipment');
  const inventoryResources = test.resources.filter(r => r.type === 'inventory');
  
  // Filter equipment based on search
  const filteredEquipmentResources = equipmentResources.filter(resource => 
    resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Filter inventory based on search
  const filteredInventoryResources = inventoryResources.filter(resource => 
    resource.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const selectedEquipment = selectedEquipmentId 
    ? equipment.find(e => e.id === selectedEquipmentId)
    : null;
    
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
  
  const daysUntilCalibration = selectedEquipment?.calibration.nextDate
    ? Math.ceil((new Date(selectedEquipment.calibration.nextDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="space-y-6">
      {/* Header with Edit Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsEditingResources(true)}
          className="flex items-center text-blue-600 hover:text-blue-700"
        >
          <Edit2 className="w-4 h-4 mr-1" />
          Edit Resources
        </button>
      </div>

      {/* Equipment Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Equipment</h3>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search equipment or inventory..."
              className="pl-9 pr-4 py-2 w-[250px] text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>
        
        {equipmentResources.length === 0 ? (
          <div className="p-6 text-center">
            <Cpu className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No Equipment Assigned</h3>
            <p className="text-sm text-gray-500">
              No equipment has been assigned to this test yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Equipment ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calibration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEquipmentResources.map((resource) => {
                  const equipItem = equipment.find(e => e.id === resource.id);
                  if (!equipItem) return null;
                  
                  const daysUntilCalibration = Math.ceil(
                    (new Date(equipItem.calibration.nextDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <tr 
                      key={resource.id}
                      className={`hover:bg-gray-50 cursor-pointer ${selectedEquipmentId === resource.id ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedEquipmentId(resource.id === selectedEquipmentId ? null : resource.id)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {resource.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {resource.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {equipItem.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {equipItem.model}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {equipItem.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(equipItem.status)}`}>
                          {equipItem.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <span>{new Date(equipItem.calibration.nextDate).toLocaleDateString()}</span>
                          {daysUntilCalibration <= 7 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              {daysUntilCalibration <= 0 ? 'Overdue' : `Due in ${daysUntilCalibration} days`}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        
        {/* Selected Equipment Details */}
        {selectedEquipment && (
          <div className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">Equipment Details: {selectedEquipment.name}</h3>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(selectedEquipment.status)}`}>
                {selectedEquipment.status}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Specifications</h4>
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-500">Manufacturer</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{selectedEquipment.manufacturer}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-500">Model</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{selectedEquipment.model}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-500">Serial Number</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{selectedEquipment.serialNumber}</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-500">Location</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{selectedEquipment.location}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Calibration</h4>
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-500">Last Calibration</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        {new Date(selectedEquipment.calibration.lastDate).toLocaleDateString()}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-500">Next Calibration</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                        <div className="flex items-center">
                          {new Date(selectedEquipment.calibration.nextDate).toLocaleDateString()}
                          {daysUntilCalibration !== null && daysUntilCalibration <= 7 && (
                            <span className="ml-2 px-1.5 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                              {daysUntilCalibration <= 0 ? 'Overdue' : `Due in ${daysUntilCalibration} days`}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-500">Calibrated By</td>
                      <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{selectedEquipment.calibration.calibratedBy}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Maintenance History */}
            {selectedEquipment.maintenanceHistory.length > 0 && (
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">Maintenance History</h4>
                <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performed By</th>
                      <th scope="col" className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedEquipment.maintenanceHistory.map((record) => (
                      <tr key={record.id}>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{record.task}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{record.performedBy}</td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">{record.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inventory Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Inventory Items</h3>
        </div>
        
        {inventoryResources.length === 0 ? (
          <div className="p-6 text-center">
            <Tag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-gray-700 mb-1">No Inventory Items Assigned</h3>
            <p className="text-sm text-gray-500">
              No inventory items have been assigned to this test yet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Manufacturer
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expiry Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventoryResources.map((resource) => {
                  const inventoryItem = items.find(i => i.id === resource.id);
                  if (!inventoryItem) return null;
                  
                  const isExpiringSoon = inventoryItem.dates?.expiry && 
                    new Date(inventoryItem.dates.expiry) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                  const isLowStock = inventoryItem.quantity <= (inventoryItem.quantity * 0.2);
                  
                  return (
                    <tr key={resource.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {resource.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {resource.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inventoryItem.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inventoryItem.manufacturer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900">{inventoryItem.quantity} {inventoryItem.unit}</span>
                          {isLowStock && (
                            <AlertTriangle className="w-4 h-4 ml-2 text-yellow-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className={`text-sm ${isExpiringSoon ? 'text-red-600' : 'text-gray-900'}`}>
                            {inventoryItem.dates?.expiry ? new Date(inventoryItem.dates.expiry).toLocaleDateString() : 'N/A'}
                          </span>
                          {isExpiringSoon && (
                            <AlertTriangle className="w-4 h-4 ml-2 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {inventoryItem.location.lab} ({inventoryItem.location.boxId})
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {inventoryItem.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Resources Modal */}
      <EditResourcesModal
        isOpen={isEditingResources}
        onClose={() => setIsEditingResources(false)}
        test={test}
      />
    </div>
  );
}