import React, { createContext, useContext, useState, ReactNode } from 'react';

export type EquipmentType = 'HPLC' | 'Centrifuge' | 'Microscope' | 'PCR' | 'Spectrophotometer' | 'Balance' | 'pH Meter';
export type EquipmentStatus = 'Available' | 'In Use' | 'Under Maintenance' | 'Out of Service' | 'Quarantined';

export interface Equipment {
  id: string;
  name: string;
  description: string;
  type: EquipmentType;
  model: string;
  manufacturer: string;
  serialNumber: string;
  location: string;
  status: EquipmentStatus;
  assignedTo?: string;
  team?: string;
  calibration: {
    lastDate: string;
    nextDate: string;
    calibratedBy: string;
    certificate?: string;
  };
  maintenanceHistory: {
    id: string;
    date: string;
    performedBy: string;
    task: string;
    status: string;
    notes?: string;
  }[];
  notes: {
    id: string;
    content: string;
    timestamp: string;
    user: string;
  }[];
  attachments: {
    id: string;
    name: string;
    type: string;
    url: string;
    uploadedAt: string;
  }[];
}

interface EquipmentContextType {
  equipment: Equipment[];
  addEquipment: (item: Omit<Equipment, 'id' | 'maintenanceHistory' | 'notes' | 'attachments'>) => void;
  updateEquipment: (id: string, updates: Partial<Equipment>) => void;
  deleteEquipment: (id: string) => void;
  addMaintenanceRecord: (id: string, record: Omit<Equipment['maintenanceHistory'][0], 'id'>) => void;
  addNote: (id: string, content: string, user: string) => void;
  addAttachment: (id: string, file: Omit<Equipment['attachments'][0], 'id'>) => void;
}

const EquipmentContext = createContext<EquipmentContextType | undefined>(undefined);

const mockEquipment: Equipment[] = [
  {
    id: 'EQP-001',
    name: 'Agilent 1260 HPLC',
    description: 'High-performance liquid chromatography system for analytical chemistry',
    type: 'HPLC',
    model: '1260 Infinity II',
    manufacturer: 'Agilent',
    serialNumber: 'DEAAB12345',
    location: 'Lab 1',
    status: 'Available',
    assignedTo: 'Dr. Sarah Chen',
    team: 'Analytical Chemistry',
    calibration: {
      lastDate: '2024-02-15',
      nextDate: '2024-05-15',
      calibratedBy: 'TechCal Services',
    },
    maintenanceHistory: [
      {
        id: 'MNT-001',
        date: '2024-02-15',
        performedBy: 'John Smith',
        task: 'Quarterly Maintenance',
        status: 'Completed',
        notes: 'Replaced pump seals, performed system test'
      }
    ],
    notes: [],
    attachments: []
  }
];

export function EquipmentProvider({ children }: { children: ReactNode }) {
  const [equipment, setEquipment] = useState<Equipment[]>(mockEquipment);

  const addEquipment = (newEquipment: Omit<Equipment, 'id' | 'maintenanceHistory' | 'notes' | 'attachments'>) => {
    const id = `EQP-${String(equipment.length + 1).padStart(3, '0')}`;
    setEquipment(prev => [...prev, {
      ...newEquipment,
      id,
      maintenanceHistory: [],
      notes: [],
      attachments: []
    }]);
  };

  const updateEquipment = (id: string, updates: Partial<Equipment>) => {
    setEquipment(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const deleteEquipment = (id: string) => {
    setEquipment(prev => prev.filter(item => item.id !== id));
  };

  const addMaintenanceRecord = (id: string, record: Omit<Equipment['maintenanceHistory'][0], 'id'>) => {
    setEquipment(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          maintenanceHistory: [
            ...item.maintenanceHistory,
            {
              id: `MNT-${String(item.maintenanceHistory.length + 1).padStart(3, '0')}`,
              ...record
            }
          ]
        };
      }
      return item;
    }));
  };

  const addNote = (id: string, content: string, user: string) => {
    setEquipment(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          notes: [
            ...item.notes,
            {
              id: `NOTE-${Date.now()}`,
              content,
              timestamp: new Date().toISOString(),
              user
            }
          ]
        };
      }
      return item;
    }));
  };

  const addAttachment = (id: string, file: Omit<Equipment['attachments'][0], 'id'>) => {
    setEquipment(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          attachments: [
            ...item.attachments,
            {
              id: `ATT-${Date.now()}`,
              ...file
            }
          ]
        };
      }
      return item;
    }));
  };

  return (
    <EquipmentContext.Provider value={{
      equipment,
      addEquipment,
      updateEquipment,
      deleteEquipment,
      addMaintenanceRecord,
      addNote,
      addAttachment
    }}>
      {children}
    </EquipmentContext.Provider>
  );
}

export function useEquipment() {
  const context = useContext(EquipmentContext);
  if (context === undefined) {
    throw new Error('useEquipment must be used within an EquipmentProvider');
  }
  return context;
}