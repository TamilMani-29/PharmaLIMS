import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEquipment } from '../../../context/EquipmentContext';
import { useInventory } from '../../../context/InventoryContext';
import { AlertTriangle, Calendar, Package, Microscope, Eye, ArrowRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

export default function AlertsSection() {
  const navigate = useNavigate();
  const location = useLocation();
  const productId = location.pathname.split('/')[2];
  const { equipment } = useEquipment();
  const { items } = useInventory();
  const [activeTab, setActiveTab] = useState<'inventory' | 'equipment'>('inventory');

  // Filter inventory items with alerts
  const inventoryAlerts = items.filter(item => {
    // Items about to expire
    if (item.dates.expiry) {
      const expiryDate = new Date(item.dates.expiry);
      const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilExpiry > 0 && daysUntilExpiry <= 7) return true;
    }
    
    // Items below 20% threshold
    if (item.quantity <= item.quantity * 0.2) return true;
    
    // Expired items still in use
    if (item.dates.expiry && new Date(item.dates.expiry) < new Date() && item.status === 'In Use') return true;
    
    return false;
  });

  // Filter equipment with alerts
  const equipmentAlerts = equipment.filter(item => {
    // Equipment due for calibration
    if (item.calibration.nextDate) {
      const calibrationDate = new Date(item.calibration.nextDate);
      const daysUntilCalibration = Math.ceil((calibrationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntilCalibration > 0 && daysUntilCalibration <= 7) return true;
    }
    
    // Equipment with overdue calibration
    if (item.calibration.nextDate && new Date(item.calibration.nextDate) < new Date()) return true;
    
    return false;
  });

  const getAlertType = (item: any): { type: string; severity: 'critical' | 'warning' | 'info' } => {
    if ('calibration' in item) {
      // Equipment
      const calibrationDate = new Date(item.calibration.nextDate);
      const daysUntilCalibration = Math.ceil((calibrationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilCalibration < 0) {
        return { type: 'Calibration Overdue', severity: 'critical' };
      } else if (daysUntilCalibration <= 7) {
        return { type: 'Calibration Due Soon', severity: 'warning' };
      }
    } else {
      // Inventory
      if (item.dates.expiry) {
        const expiryDate = new Date(item.dates.expiry);
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry < 0 && item.status === 'In Use') {
          return { type: 'Expired Item In Use', severity: 'critical' };
        } else if (daysUntilExpiry <= 7 && daysUntilExpiry > 0) {
          return { type: 'Expiring Soon', severity: 'warning' };
        }
      }
      
      if (item.quantity <= item.quantity * 0.2) {
        return { type: 'Low Stock', severity: 'warning' };
      }
    }
    
    return { type: 'Unknown', severity: 'info' };
  };

  const getSeverityColor = (severity: 'critical' | 'warning' | 'info') => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-2">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'inventory' 
              ? 'text-blue-600 border-b-2 border-blue-500' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Inventory ({inventoryAlerts.length})
        </button>
        <button
          onClick={() => setActiveTab('equipment')}
          className={`px-4 py-2 text-sm font-medium ${
            activeTab === 'equipment' 
              ? 'text-blue-600 border-b-2 border-blue-500' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Microscope className="w-4 h-4 inline mr-2" />
          Equipment ({equipmentAlerts.length})
        </button>
      </div>

      {/* Alert List */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {activeTab === 'inventory' ? (
          inventoryAlerts.length > 0 ? (
            inventoryAlerts.map(item => {
              const alert = getAlertType(item);
              return (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">{item.name}</p>
                      <div className="flex items-center mt-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.type}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          {item.quantity} {item.unit} left
                        </span>
                        {item.dates.expiry && (
                          <span className="text-xs text-gray-500 ml-2">
                            Expires: {new Date(item.dates.expiry).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No inventory alerts</p>
            </div>
          )
        ) : (
          equipmentAlerts.length > 0 ? (
            equipmentAlerts.map(item => {
              const alert = getAlertType(item);
              return (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-blue-500 mr-2" />
                    <div>
                      <p className="text-xs font-medium text-gray-900">{item.name}</p>
                      <div className="flex items-center mt-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                          {alert.type}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          Due: {new Date(item.calibration.nextDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-6">
              <Microscope className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-500">No equipment alerts</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}