import React, { useState, useRef } from 'react';
import { Plus, Filter } from 'lucide-react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { useSamples } from '../../context/SampleContext';
import NewTestStepModal from './modals/NewTestStepModal';
import TestStepDetailsModal from './modals/TestStepDetailsModal';
import FiltersModal from './modals/FiltersModal';

// Mock test steps data
const mockTestSteps: TestStep[] = [
  {
    id: 'STEP_001',
    sampleId: 'SAM-001',
    aliquotId: 'ALQ-001',
    testId: 'TST-001',
    stepName: 'HPLC Analysis',
    equipmentId: 'HPLC_01',
    analystId: 'ANL_01',
    startTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    status: 'Scheduled'
  },
  {
    id: 'STEP_002',
    sampleId: 'SAM-001',
    aliquotId: 'ALQ-002',
    testId: 'TST-002',
    stepName: 'Centrifugation',
    equipmentId: 'CENT_01',
    analystId: 'ANL_02',
    startTime: new Date(new Date().setHours(13, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(14, 0, 0, 0)).toISOString(),
    status: 'In Progress'
  }
];

// Helper function to check if two time ranges overlap
export const hasOverlap = (start1: string, end1: string, start2: string, end2: string) => {
  const s1 = new Date(start1).getTime();
  const e1 = new Date(end1).getTime();
  const s2 = new Date(start2).getTime();
  const e2 = new Date(end2).getTime();
  return s1 < e2 && e1 > s2;
};

// Helper function to check resource availability
export const checkResourceAvailability = (
  steps: TestStep[],
  startTime: string,
  endTime: string,
  equipmentId: string,
  analystId: string,
  excludeStepId?: string
) => {
  return steps
    .filter(step => step.id !== excludeStepId)
    .filter(step => 
      (step.equipmentId === equipmentId || step.analystId === analystId) &&
      hasOverlap(startTime, endTime, step.startTime, step.endTime)
    );
};

// Mock data for equipment and analysts
const EQUIPMENT = [
  { id: 'HPLC_01', name: 'HPLC System 1', type: 'HPLC' },
  { id: 'CENT_01', name: 'Centrifuge 1', type: 'Centrifuge' },
  { id: 'SPEC_01', name: 'Spectrophotometer 1', type: 'Spectrophotometer' },
];

const ANALYSTS = [
  { id: 'ANL_01', name: 'Dr. Sarah Chen' },
  { id: 'ANL_02', name: 'Dr. Mike Johnson' },
  { id: 'ANL_03', name: 'Dr. Emily Taylor' },
];

type TestStep = {
  id: string;
  sampleId: string;
  aliquotId: string;
  testId: string;
  stepName: string;
  equipmentId: string;
  analystId: string;
  startTime: string;
  endTime: string;
  status: 'Scheduled' | 'In Progress' | 'Completed';
};

export default function SchedulingCalendar() {
  const { samples } = useSamples();
  const calendarRef = useRef<any>(null);
  const [showNewStepModal, setShowNewStepModal] = useState(false);
  const [showStepDetailsModal, setShowStepDetailsModal] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedStep, setSelectedStep] = useState<TestStep | null>(null);
  const [testSteps, setTestSteps] = useState<TestStep[]>(mockTestSteps);
  const [filters, setFilters] = useState({
    sampleId: '',
    aliquotId: '',
    status: [] as string[],
    equipment: [] as string[],
    analyst: [] as string[],
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return '#3B82F6'; // blue-500
      case 'In Progress':
        return '#F59E0B'; // amber-500
      case 'Completed':
        return '#10B981'; // emerald-500
      default:
        return '#6B7280'; // gray-500
    }
  };

  const handleDateSelect = (selectInfo: any) => {
    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // Clear selection
    
    // Format the dates properly
    const start = new Date(selectInfo.start);
    const end = new Date(selectInfo.end);
    
    setSelectedTimeSlot({
      start,
      end,
    });
    setShowNewStepModal(true);
  };

  const handleEventClick = (clickInfo: any) => {
    const step = testSteps.find(step => step.id === clickInfo.event.id);
    if (step) {
      setSelectedStep(step);
      setShowStepDetailsModal(true);
    }
  };

  const handleAddTestStep = (newStep: TestStep) => {
    const formattedStep = {
      ...newStep,
      startTime: new Date(newStep.startTime).toISOString(),
      endTime: new Date(newStep.endTime).toISOString()
    };
    setTestSteps(prev => [...prev, formattedStep]);
    setShowNewStepModal(false);
  };

  const handleUpdateTestStep = (updatedStep: TestStep) => {
    const formattedStep = {
      ...updatedStep,
      startTime: new Date(updatedStep.startTime).toISOString(),
      endTime: new Date(updatedStep.endTime).toISOString()
    };
    setTestSteps(prev => prev.map(step => 
      step.id === formattedStep.id ? formattedStep : step
    ));
    setShowStepDetailsModal(false);
    setSelectedStep(null);
  };

  const handleDeleteTestStep = (stepId: string) => {
    setTestSteps(prev => prev.filter(step => step.id !== stepId));
    setShowStepDetailsModal(false);
    setSelectedStep(null);
  };

  const events = testSteps
    .filter(step => {
      if (filters.sampleId && step.sampleId !== filters.sampleId) return false;
      if (filters.aliquotId && step.aliquotId !== filters.aliquotId) return false;
      if (filters.status.length && !filters.status.includes(step.status)) return false;
      if (filters.equipment.length && !filters.equipment.includes(step.equipmentId)) return false;
      if (filters.analyst.length && !filters.analyst.includes(step.analystId)) return false;
      return true;
    })
    .map(step => ({
      id: step.id,
      title: `${step.stepName} - ${EQUIPMENT.find(e => e.id === step.equipmentId)?.name}`,
      start: step.startTime,
      end: step.endTime,
      backgroundColor: getStatusColor(step.status),
      borderColor: getStatusColor(step.status),
      extendedProps: {
        analyst: ANALYSTS.find(a => a.id === step.analystId)?.name,
        equipment: EQUIPMENT.find(e => e.id === step.equipmentId)?.name,
      },
    }));

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Test Schedule</h1>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowFiltersModal(true)}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button
            onClick={() => {
              setSelectedTimeSlot({
                start: new Date(),
                end: new Date(new Date().setMinutes(new Date().getMinutes() + 30)),
              });
              setShowNewStepModal(true);
            }}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Test
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          editable={true}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={true}
          weekends={false}
          allDaySlot={false}
          nowIndicator={true}
          eventOverlap={false}
          eventResizableFromStart={true}
          slotMinTime="08:00:00"
          slotMaxTime="18:00:00"
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventDrop={(info) => {
            const step = testSteps.find(s => s.id === info.event.id);
            if (step) {
              const updatedStep = {
                ...step,
                startTime: info.event.start?.toISOString() || step.startTime,
                endTime: info.event.end?.toISOString() || step.endTime
              };
              handleUpdateTestStep(updatedStep);
            }
          }}
          eventResize={(info) => {
            const step = testSteps.find(s => s.id === info.event.id);
            if (step) {
              const updatedStep = {
                ...step,
                startTime: info.event.start?.toISOString() || step.startTime,
                endTime: info.event.end?.toISOString() || step.endTime
              };
              handleUpdateTestStep(updatedStep);
            }
          }}
          eventContent={(eventInfo) => (
            <div className="p-1 overflow-hidden">
              <div className="font-medium text-sm truncate">{eventInfo.event.title}</div>
              <div className="text-xs truncate">{eventInfo.event.extendedProps.analyst}</div>
            </div>
          )}
        />
      </div>

      {/* Modals */}
      <NewTestStepModal
        isOpen={showNewStepModal}
        onClose={() => setShowNewStepModal(false)}
        onAdd={handleAddTestStep}
        timeSlot={selectedTimeSlot}
        samples={samples}
        equipment={EQUIPMENT}
        analysts={ANALYSTS}
        testSteps={testSteps}
      />

      <TestStepDetailsModal
        isOpen={showStepDetailsModal}
        onClose={() => {
          setShowStepDetailsModal(false);
          setSelectedStep(null);
        }}
        step={selectedStep}
        onUpdate={handleUpdateTestStep}
        onDelete={handleDeleteTestStep}
        equipment={EQUIPMENT}
        analysts={ANALYSTS}
        samples={samples}
      />

      <FiltersModal
        isOpen={showFiltersModal}
        onClose={() => setShowFiltersModal(false)}
        filters={filters}
        onFiltersChange={setFilters}
        samples={samples}
        equipment={EQUIPMENT}
        analysts={ANALYSTS}
      />
    </div>
  );
}