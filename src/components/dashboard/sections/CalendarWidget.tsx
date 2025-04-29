import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTests } from '../../../context/TestContext';
import { useEquipment } from '../../../context/EquipmentContext';
import { Calendar, Beaker, Microscope, TestTube2, ChevronRight } from 'lucide-react';
import { useLocation } from 'react-router-dom';

// Mock calendar events
const mockEvents = [
  {
    id: 'evt-1',
    title: 'HPLC Analysis',
    type: 'test',
    date: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    entityId: 'TST-001',
    assignedTo: 'Dr. Sarah Chen'
  },
  {
    id: 'evt-2',
    title: 'pH Meter Calibration',
    type: 'equipment',
    date: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    entityId: 'EQP-001',
    assignedTo: 'Technical Services'
  },
  {
    id: 'evt-3',
    title: 'Sample Expiry: Product A',
    type: 'sample',
    date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(),
    entityId: 'SAM-001',
    assignedTo: null
  },
  {
    id: 'evt-4',
    title: 'Stability Testing',
    type: 'test',
    date: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
    entityId: 'TST-002',
    assignedTo: 'Dr. Mike Johnson'
  },
  {
    id: 'evt-5',
    title: 'Centrifuge Maintenance',
    type: 'equipment',
    date: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(),
    entityId: 'EQP-002',
    assignedTo: 'Technical Services'
  }
];

export default function CalendarWidget() {
  const navigate = useNavigate();
  const location = useLocation();
  const productId = location.pathname.split('/')[2];
  const { tests } = useTests();
  const { equipment } = useEquipment();

  // Group events by day
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

  const todayEvents = mockEvents.filter(
    event => new Date(event.date).toDateString() === today.toDateString()
  );
  
  const tomorrowEvents = mockEvents.filter(
    event => new Date(event.date).toDateString() === tomorrow.toDateString()
  );
  
  const upcomingEvents = mockEvents.filter(
    event => 
      new Date(event.date) > dayAfterTomorrow && 
      new Date(event.date) <= new Date(today.setDate(today.getDate() + 7))
  );

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'test':
        return <Beaker className="w-4 h-4 text-blue-500" />;
      case 'equipment':
        return <Microscope className="w-4 h-4 text-yellow-500" />;
      case 'sample':
        return <TestTube2 className="w-4 h-4 text-purple-500" />;
      default:
        return <Calendar className="w-4 h-4 text-gray-500" />;
    }
  };

  const renderEventList = (events, title) => (
    <div className="mb-4">
      <h3 className="text-xs font-medium text-gray-700 mb-1">{title}</h3>
      {events.length > 0 ? (
        <div className="space-y-2">
          {events.map(event => (
            <div 
              key={event.id}
              className="flex items-center justify-between p-1.5 bg-gray-50 rounded-lg"
            >
              <div className="flex items-center">
                {getEventIcon(event.type)}
                <span className="ml-2 text-xs text-gray-900">{event.title}</span>
                {event.assignedTo && (
                  <span className="ml-2 text-xs text-gray-500">({event.assignedTo})</span>
                )}
              </div>
              <span className="text-xs text-gray-500">
                {new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-500 py-1">No events scheduled</p>
      )}
    </div>
  );

  return (
    <div>
      {renderEventList(todayEvents, 'Today')}
      {renderEventList(tomorrowEvents, 'Tomorrow')}
      {renderEventList(upcomingEvents, 'Upcoming')}
    </div>
  );
}