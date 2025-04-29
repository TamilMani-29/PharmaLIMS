import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, AlertTriangle, AlertCircle, Trash2 } from 'lucide-react';
import { InventoryItem } from '../../../context/InventoryContext';

interface InventoryTableProps {
  items: InventoryItem[];
  onItemClick: (itemId: string) => void;
  onDeleteItem: (itemId: string) => void;
}

export default function InventoryTable({ items, onItemClick, onDeleteItem }: InventoryTableProps) {
  const getStatusColor = (status: string, expiryDate: string | undefined) => {
    const daysUntilExpiry = expiryDate 
      ? Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      : null;
    
    switch (status) {
      case 'In Use':
        return 'bg-green-100 text-green-800';
      case 'About to Expire':
      case 'About to Deplete':
        return 'bg-yellow-100 text-yellow-800';
      case 'Expired':
      case 'Depleted':
        return 'bg-red-100 text-red-800';
      case 'Quarantined':
        return 'bg-purple-100 text-purple-800';
      default:
        return daysUntilExpiry !== null && daysUntilExpiry <= 30 
          ? 'bg-yellow-100 text-yellow-800' 
          : 'bg-gray-100 text-gray-800';
    }
  };

  return (
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
              Quantity
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expiry Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item) => {
            const daysUntilExpiry = item.dates?.expiry
              ? Math.ceil((new Date(item.dates.expiry).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null;
            const isLowStock = item.quantity <= (item.quantity * 0.2);

            return (
              <tr
                key={item.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onItemClick(item.id)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {item.id}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex items-center">
                    {item.name}
                    {((daysUntilExpiry !== null && daysUntilExpiry <= 30) || isLowStock) && (
                      <AlertTriangle className="w-4 h-4 ml-2 text-yellow-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    {item.quantity} {item.unit}
                    {isLowStock && (
                      <AlertCircle className="w-4 h-4 ml-2 text-yellow-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.location?.lab} - {item.location?.freezer}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center">
                    {item.dates?.expiry}
                    {daysUntilExpiry !== null && daysUntilExpiry <= 30 && (
                      <AlertTriangle className="w-4 h-4 ml-2 text-yellow-500" />
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(item.status, item.dates?.expiry)}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemClick(item.id);
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteItem(item.id);
                    }}
                    className="text-red-600 hover:text-red-900 ml-2"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}