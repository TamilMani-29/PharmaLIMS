import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSpecifications, SpecificationParameter } from './SpecificationContext';

export type TestType = 'Chemical Analysis' | 'Physical Testing' | 'Stability Study' | 'Microbial Testing' | 'Method Validation';
export type TestStatus = 'Not Started' | 'In Progress' | 'Completed';
export type StepStatus = 'Not Started' | 'In Progress' | 'Complete';

export interface TestStep {
  id: string;
  name: string;
  description: string[];
  status: StepStatus;
  startTime?: string;
  completionTime?: string;
  results?: string;
  notes?: {
    id: string;
    content: string;
    timestamp: string;
    user: string;
  }[];
  attachments?: {
    id: string;
    name: string;
    url: string;
    uploadedAt: string;
  }[];
}

export interface SampleTest {
  sampleId: string;
  sampleName: string;
  aliquotId?: string;
  status: TestStatus;
  startDate?: string;
  completedDate?: string;
  steps: TestStep[];
  results?: string;
  resultDetails?: string;
  acceptanceCriteria?: string;
  resultStatus?: 'Pass' | 'Fail' | 'Inconclusive';
  specificationId?: string;
  parameterId?: string;
}

export interface TestResource {
  id: string;
  type: 'equipment' | 'inventory';
  name: string;
  quantity?: number;
  assignedTime?: {
    start: string;
    end: string;
  };
}

export interface Test {
  id: string;
  name: string;
  type: TestType;
  specificationId?: string;
  parameterId?: string;
  description: string;
  createdDate: string;
  startDate?: string;
  dueDate?: string;
  status: TestStatus;
  sopId: string;
  samples: SampleTest[];
  resources: TestResource[];
  notes: {
    id: string;
    content: string;
    timestamp: string;
    user: string;
  }[];
}

interface TestContextType {
  tests: Test[];
  addTest: (test: Omit<Test, 'id' | 'notes'>) => string;
  addSampleToTest: (testId: string, sample: SampleTest) => void;
  updateTest: (id: string, updates: Partial<Test>) => void;
  updateSampleStatus: (testId: string, sampleId: string, status: TestStatus) => void;
  updateStepStatus: (testId: string, sampleId: string, stepId: string, status: StepStatus, resultData?: any) => void;
  addStepNote: (testId: string, sampleId: string, stepId: string, note: string, user: string) => void;
  addNote: (testId: string, content: string, user: string) => void;
  addAttachment: (testId: string, sampleId: string, stepId: string, file: { name: string; url: string }) => void;
  deleteTest: (testId: string) => void;
  getTestResultForParameter: (testId: string, parameterId: string) => { value: string; status: 'Pass' | 'Fail' | 'Pending' } | null;
}

const TestContext = createContext<TestContextType | undefined>(undefined);

const mockTests: Test[] = [
  {
    id: 'TST-001',
    name: 'pH Analysis',
    type: 'Chemical Analysis',
    specificationId: 'SPEC-001',
    parameterId: 'PARAM-001',
    description: 'Standard pH analysis for quality control',
    createdDate: '2024-03-15',
    startDate: '2024-03-16',
    dueDate: '2024-03-20',
    status: 'In Progress',
    sopId: 'SOP-001',
    samples: [
      {
        sampleId: 'SAM-001',
        sampleName: 'Test Sample A',
        aliquotId: 'ALQ-001',
        status: 'In Progress',
        startDate: '2024-03-16',
        steps: [
          {
            id: 'STP-001',
            name: 'Sample Preparation',
            description: [
              'Ensure all required materials are available and at room temperature',
              'Label sample containers with unique identifiers',
              'Prepare buffer solutions according to SOP specifications',
              'Document initial sample weight and volume measurements',
              'Filter samples using 0.45μm membrane filter if required'
            ],
            status: 'Complete',
            notes: ['Sample prepared as per protocol'],
          },
          {
            id: 'STP-002',
            name: 'pH Measurement',
            description: [
              'Calibrate pH meter using standard buffer solutions (pH 4.0, 7.0, and 10.0)',
              'Verify calibration accuracy with a check standard',
              'Rinse electrode with deionized water between measurements',
              'Measure sample pH in triplicate and record all readings',
              'Calculate average pH value and standard deviation',
              'Clean and store electrode according to manufacturer guidelines'
            ],
            status: 'In Progress',
          }
        ]
      }
    ],
    resources: [
      {
        id: 'EQP-001',
        type: 'equipment',
        name: 'pH Meter',
        assignedTime: {
          start: '2024-03-16T09:00:00',
          end: '2024-03-16T17:00:00'
        }
      },
      {
        id: 'INV-001',
        type: 'inventory',
        name: 'Buffer Solution',
        quantity: 100
      }
    ],
    notes: []
  }
];

export function TestProvider({ children }: { children: ReactNode }) {
  const specContext = useSpecifications();
  const [tests, setTests] = useState<Test[]>(mockTests);
  const { specifications, linkTestToParameter } = useSpecifications();
  
  // This function adds a test and returns the new test ID
  const addTest = (newTest: Omit<Test, 'id' | 'notes'>): string => {
    const id = `TST-${String(tests.length + 1).padStart(3, '0')}`;

    // Add the test without automatically linking to parameter
    setTests(prev => [...prev, { ...newTest, id, notes: [] }]);    
    
    return id;
  };

  const addSampleToTest = (testId: string, sample: SampleTest) => {
    setTests(prev => prev.map(test => {
      if (test.id === testId) {
        return {
          ...test,
          samples: [...test.samples, sample]
        };
      }
      return test;
    }));
  };

  const updateTest = (id: string, updates: Partial<Test>) => {
    setTests(prev => prev.map(test => 
      test.id === id ? { 
        ...test, 
        ...updates,
        // If status is being updated, update the startDate if moving to In Progress
        ...(updates.status === 'In Progress' && test.status === 'Not Started' ? 
          { startDate: new Date().toISOString() } : {}),
      } : test
    ));
  };

  const updateSampleStatus = (testId: string, sampleId: string, status: TestStatus) => {
    setTests(prev => prev.map(test => {
      if (test.id === testId) {
        return {
          ...test,
          samples: test.samples.map(sample => 
            sample.sampleId === sampleId ? { ...sample, status } : sample
          )
        };
      }
      return test;
    }));
  };

  const updateStepStatus = (testId: string, sampleId: string, stepId: string, status: StepStatus, resultData?: any) => {
    setTests(prev => prev.map(test => {
      if (test.id === testId) {
        const updatedTest = {
          ...test,
          samples: test.samples.map(sample => {
            if (sample.sampleId === sampleId) {
              const updatedSteps = sample.steps.map(step =>
                step.id === stepId ? { 
                  ...step, 
                  status,
                  ...(resultData && { results: resultData.results }),
                } : step
              );
              
              // Check if all steps are complete
              const allStepsComplete = updatedSteps.every(step => step.status === 'Complete');
              
              return {
                ...sample,
                steps: updatedSteps,
                status: allStepsComplete ? 'Completed' : 'In Progress',
                ...(resultData && allStepsComplete && { 
                  results: resultData.results,
                  resultDetails: resultData.resultDetails,
                  acceptanceCriteria: resultData.acceptanceCriteria,
                  resultStatus: resultData.resultStatus,
                  specificationId: resultData.specificationId,
                  parameterId: resultData.parameterId
                })
              };
            }
            return sample;
          })
        };
        
        // Check if the test is now completed
        const isTestCompleted = updatedTest.samples.every(sample => sample.status === 'Completed');
        if (isTestCompleted && updatedTest.status !== 'Completed') { 
          updatedTest.status = 'Completed';
        }
        
        return updatedTest;
      }
      return test;
    }));
  };

  const addNote = (testId: string, content: string, user: string) => {
    setTests(prev => prev.map(test => {
      if (test.id === testId) {
        return {
          ...test,
          notes: [
            ...test.notes,
            {
              id: `NOTE-${Date.now()}`,
              content,
              timestamp: new Date().toISOString(),
              user
            }
          ]
        };
      }
      return test;
    }));
  };

  const addAttachment = (testId: string, sampleId: string, stepId: string, file: { name: string; url: string }) => {
    setTests(prev => prev.map(test => {
      if (test.id === testId) {
        return {
          ...test,
          samples: test.samples.map(sample => {
            if (sample.sampleId === sampleId) {
              return {
                ...sample,
                steps: sample.steps.map(step => {
                  if (step.id === stepId) {
                    return {
                      ...step,
                      attachments: [
                        ...(step.attachments || []),
                        {
                          id: `ATT-${Date.now()}`,
                          name: file.name,
                          url: file.url,
                          uploadedAt: new Date().toISOString()
                        }
                      ]
                    };
                  }
                  return step;
                })
              };
            }
            return sample;
          })
        };
      }
      return test;
    }));
  };

  const addStepNote = (testId: string, sampleId: string, stepId: string, content: string, user: string) => {
    setTests(prev => prev.map(test => {
      if (test.id === testId) {
        return {
          ...test,
          samples: test.samples.map(sample => {
            if (sample.sampleId === sampleId) {
              return {
                ...sample,
                steps: sample.steps.map(step => {
                  if (step.id === stepId) {
                    return {
                      ...step,
                      notes: [
                        ...(step.notes || []),
                        {
                          id: `NOTE-${Date.now()}`,
                          content,
                          timestamp: new Date().toISOString(),
                          user
                        }
                      ]
                    };
                  }
                  return step;
                })
              };
            }
            return sample;
          })
        };
      }
      return test;
    }));
  };

  const deleteTest = (testId: string) => {
    setTests(prev => prev.filter(test => test.id !== testId));
  };

  const getTestResultForParameter = (testId: string, parameterId: string) => {
    const test = tests.find(t => t.id === testId);
    if (!test || test.status !== 'Completed') return null;
    
    // In a real application, you would have a more sophisticated way to match test results to parameters
    // This is a simplified mock implementation
    const mockResults = {
      'PARAM-001': { value: '7.2', status: 'Pass' as const },
      'default': { value: 'Meets requirements', status: 'Pass' as const }
    };
    
    return mockResults[parameterId] || mockResults.default;
  };

  return (
    <TestContext.Provider value={{
      tests,
      addTest,
      addSampleToTest,
      updateTest,
      updateSampleStatus,
      updateStepStatus,
      addStepNote,
      addNote,
      addAttachment,
      deleteTest,
      getTestResultForParameter
    }}>
      {children}
    </TestContext.Provider>
  );
}

export function useTests() {
  const context = useContext(TestContext);
  if (context === undefined) {
    throw new Error('useTests must be used within a TestProvider');
  }
  return context;
}