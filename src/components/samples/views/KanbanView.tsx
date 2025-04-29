import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { User, Clock, Beaker, AlertCircle } from 'lucide-react';
import { useSamples, Sample } from '../../../context/SampleContext';

const SAMPLE_STAGES = [
  {
    id: 'submitted',
    name: 'Sample Submitted',
    description: 'Sample has been registered in the system'
  },
  {
    id: 'aliquots_created',
    name: 'Aliquots Created',
    description: 'Sample has been divided into aliquots'
  },
  {
    id: 'aliquots_plated',
    name: 'Aliquots Plated',
    description: 'Aliquots have been plated for testing'
  },
  {
    id: 'testing_completed',
    name: 'Testing Completed',
    description: 'All tests have been completed'
  },
  {
    id: 'in_storage',
    name: 'In Storage',
    description: 'Sample has been archived in storage'
  }
];

interface KanbanViewProps {
  onSampleClick: (sampleId: string) => void;
}

export default function KanbanView({ onSampleClick }: KanbanViewProps) {
  const { samples, updateSample } = useSamples();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'bg-blue-50 border-blue-200';
      case 'aliquots_created':
        return 'bg-yellow-50 border-yellow-200';
      case 'aliquots_plated':
        return 'bg-red-50 border-red-200';
      case 'testing_completed':
        return 'bg-yellow-50 border-yellow-200';
      case 'in_storage':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination || !draggableId) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId;
    updateSample(draggableId, { status: newStatus });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex h-full overflow-x-auto p-4 space-x-4">
        {SAMPLE_STAGES.map((stage) => (
          <div key={stage.id} className="flex-none w-80">
            <div className="bg-gray-50 rounded-lg p-4 h-full">
              <h3 className="font-medium text-gray-900 mb-4 flex items-center justify-between">
                {stage.name}
                <span className="bg-gray-200 text-gray-700 text-sm px-2 py-1 rounded">
                  {samples.filter((s) => s.status === stage.id).length}
                </span>
              </h3>
              
              <Droppable droppableId={stage.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-3"
                  >
                    {[...samples]
                      .filter((sample) => sample.status === stage.id)
                      .map((sample, index) => (
                        <Draggable
                          key={sample.id}
                          draggableId={sample.id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => onSampleClick(sample.id)}
                              className={`bg-white rounded-lg border p-3 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${getStatusColor(sample.status)} ${provided.draggableProps.style?.transform ? 'shadow-lg' : ''}`}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <span className="font-medium text-gray-900">
                                  {sample.id}
                                </span>
                                <span className="text-sm text-gray-500">
                                  {sample.type}
                                </span>
                              </div>
                              
                              <div className="flex items-center text-sm text-gray-600 space-x-4">
                                <div className="flex items-center">
                                  <Beaker className="w-4 h-4 mr-1" />
                                  {sample.aliquotsCreated} aliquots
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-4 h-4 mr-1" />
                                  {sample.location}
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}