import React from 'react';
import { Clock } from 'lucide-react';

interface TimelineEvent {
  event: string;
  date: string;
  user: string;
}

interface TimelineTabProps {
  events: TimelineEvent[];
}

export default function TimelineTab({ events }: TimelineTabProps) {
  return (
    <div className="space-y-4">
      {events.map((event, index) => (
        <div
          key={index}
          className="flex items-start space-x-3"
        >
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">
              {event.event}
            </p>
            <p className="text-xs text-gray-500">
              {event.date} by {event.user}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}