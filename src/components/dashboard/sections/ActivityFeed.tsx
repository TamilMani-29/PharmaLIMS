import React from 'react';
import { 
  TestTube2, 
  Beaker, 
  Package, 
  Microscope, 
  ClipboardList, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User
} from 'lucide-react';

// Mock activity data
const activities = [
  {
    id: 'act-1',
    type: 'sample_registered',
    title: 'Sample Registered',
    description: 'New sample SAM-003 registered',
    timestamp: '2024-05-15T10:30:00Z',
    user: 'Dr. Sarah Chen',
    entityId: 'SAM-003'
  },
  {
    id: 'act-2',
    type: 'test_created',
    title: 'Test Created',
    description: 'New pH analysis test created',
    timestamp: '2024-05-15T09:45:00Z',
    user: 'Dr. Mike Johnson',
    entityId: 'TST-005'
  },
  {
    id: 'act-3',
    type: 'test_failed',
    title: 'Test Failed',
    description: 'Dissolution test failed for Product A',
    timestamp: '2024-05-14T16:20:00Z',
    user: 'Dr. Emily Taylor',
    entityId: 'TST-002'
  },
  {
    id: 'act-4',
    type: 'inventory_added',
    title: 'Inventory Added',
    description: 'Added 500g of Sodium Chloride',
    timestamp: '2024-05-14T14:15:00Z',
    user: 'John Smith',
    entityId: 'INV-002'
  },
  {
    id: 'act-5',
    type: 'equipment_calibrated',
    title: 'Equipment Calibrated',
    description: 'HPLC System calibrated',
    timestamp: '2024-05-14T11:30:00Z',
    user: 'Technical Services',
    entityId: 'EQP-001'
  },
  {
    id: 'act-6',
    type: 'specification_updated',
    title: 'Specification Updated',
    description: 'Updated pH range for Product A',
    timestamp: '2024-05-13T16:45:00Z',
    user: 'Dr. James Wilson',
    entityId: 'SPEC-001'
  }
];

export default function ActivityFeed() {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'sample_registered':
        return <TestTube2 className="w-4 h-4 text-purple-500" />;
      case 'test_created':
      case 'test_failed':
      case 'test_completed':
        return <Beaker className="w-4 h-4 text-blue-500" />;
      case 'inventory_added':
      case 'inventory_updated':
        return <Package className="w-4 h-4 text-green-500" />;
      case 'equipment_calibrated':
      case 'equipment_maintenance':
        return <Microscope className="w-4 h-4 text-yellow-500" />;
      case 'specification_updated':
      case 'specification_created':
        return <ClipboardList className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hr ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  return (
    <div className="space-y-3">
      {activities.map(activity => (
        <div key={activity.id} className="flex space-x-2">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
              {getActivityIcon(activity.type)}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-900">
              {activity.title}
            </p>
            <p className="text-xs text-gray-500">
              {activity.description}
            </p>
            <div className="flex items-center mt-0.5 text-xs text-gray-500">
              <User className="w-2.5 h-2.5 mr-1" />
              <span>{activity.user}</span>
              <span className="mx-1">•</span>
              <span>{formatTimeAgo(activity.timestamp)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}