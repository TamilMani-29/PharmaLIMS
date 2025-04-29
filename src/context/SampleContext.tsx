import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface Sample {
  id: string;
  name: string;
  type: string;
  submissionDate: string;
  status: 'submitted' | 'aliquots_created' | 'aliquots_plated' | 'testing_completed' | 'in_storage';
  owner: string;
  boxId: string;
  location: string;
  lastMovement: string;
  volumeLeft: number;
  totalVolume: number;
  aliquotsCreated: number;
  aliquots: Aliquot[];
}

export interface Aliquot {
  id: string;
  volume: number;
  createdAt: string;
  location: string;
  tests: Test[];
}

export interface Test {
  id: string;
  name: string;
  status: 'Pending' | 'In Progress' | 'Completed' | 'Failed';
  assignedTo: string;
  startDate: string;
  completionDate?: string;
  method: string;
  results?: string;
  notes?: string;
}

interface SampleContextType {
  samples: Sample[];
  addSample: (sample: Sample) => void;
  deleteSample: (id: string) => void;
  updateSample: (id: string, updates: Partial<Sample>) => void;
  addAliquot: (sampleId: string, aliquot: Aliquot) => void;
  addTest: (sampleId: string, aliquotId: string, test: Test) => void;
}

const SampleContext = createContext<SampleContextType | undefined>(undefined);

const initialSamples: Sample[] = [
  {
    id: 'SAM-001',
    name: 'Test Sample A',
    type: 'API Raw Material',
    submissionDate: '2024-03-10',
    status: 'submitted',
    owner: 'Dr. Sarah Chen',
    boxId: 'BOX-A1',
    location: 'QC Lab',
    lastMovement: '2024-03-12 14:30',
    volumeLeft: 7,
    totalVolume: 10,
    aliquotsCreated: 3,
    aliquots: [
      {
        id: 'ALQ-001',
        volume: 1,
        createdAt: '2024-03-10 11:30',
        location: 'QC Lab',
        tests: [
          {
            id: 'TST-001',
            name: 'pH Analysis',
            status: 'Completed',
            assignedTo: 'Dr. Sarah Chen',
            startDate: '2024-03-10 13:00',
            completionDate: '2024-03-10 14:30',
            method: 'pH-001',
            results: 'pH 7.4',
            notes: 'Within acceptable range'
          }
        ]
      },
      {
        id: 'ALQ-002',
        volume: 1,
        createdAt: '2024-03-10 11:30',
        location: 'Stability Chamber',
        tests: [
          {
            id: 'TST-002',
            name: 'Stability Test',
            status: 'In Progress',
            assignedTo: 'Dr. Mike Johnson',
            startDate: '2024-03-11 09:00',
            method: 'STB-003'
          }
        ]
      },
      {
        id: 'ALQ-003',
        volume: 1,
        createdAt: '2024-03-10 11:30',
        location: 'Method Lab',
        tests: []
      },
    ],
  },
  // Add other samples with similar structure...
];

export function SampleProvider({ children }: { children: ReactNode }) {
  const [samples, setSamples] = useState<Sample[]>(initialSamples);

  const addSample = (newSample: Sample) => {
    setSamples(prevSamples => [...prevSamples, newSample]);
  };

  const deleteSample = (id: string) => {
    setSamples(prevSamples => prevSamples.filter(sample => sample.id !== id));
  };

  const updateSample = (id: string, updates: Partial<Sample>) => {
    setSamples(prevSamples => 
      prevSamples.map(sample => 
        sample.id === id ? { ...sample, ...updates } : sample
      )
    );
  };

  const addAliquot = (sampleId: string, newAliquot: Aliquot) => {
    setSamples(prevSamples =>
      prevSamples.map(sample => {
        if (sample.id === sampleId) {
          const volumeLeft = sample.volumeLeft - newAliquot.volume;
          return {
            ...sample,
            aliquots: [...sample.aliquots, newAliquot],
            aliquotsCreated: sample.aliquotsCreated + 1,
            volumeLeft,
            lastMovement: new Date().toISOString().split('T').join(' ').slice(0, 16),
          };
        }
        return sample;
      })
    );
  };

  const addTest = (sampleId: string, aliquotId: string, newTest: Test) => {
    setSamples(prevSamples =>
      prevSamples.map(sample => {
        if (sample.id === sampleId) {
          return {
            ...sample,
            aliquots: sample.aliquots.map(aliquot => {
              if (aliquot.id === aliquotId) {
                return {
                  ...aliquot,
                  tests: [...aliquot.tests, newTest]
                };
              }
              return aliquot;
            })
          };
        }
        return sample;
      })
    );
  };

  return (
    <SampleContext.Provider value={{ 
      samples, 
      addSample,
      deleteSample,
      updateSample, 
      addAliquot, 
      addTest 
    }}>
      {children}
    </SampleContext.Provider>
  );
}

export function useSamples() {
  const context = useContext(SampleContext);
  if (context === undefined) {
    throw new Error('useSamples must be used within a SampleProvider');
  }
  return context;
}