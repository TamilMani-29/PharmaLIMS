import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SpecificationType = 'Physical' | 'Chemical' | 'Microbial' | 'Performance' | 'Stability' | 'Other';
export type SpecificationStatus = 'Draft' | 'Active' | 'Obsolete';

export interface SpecificationParameter {
  id: string;
  name: string;
  type: SpecificationType;
  unit: string;
  expectedValue: string;
  linkedTestIds?: string[];
  acceptableRange?: {
    min: number;
    max: number;
  };
  testMethod?: string;
  mandatory: boolean;
  regulatoryReference?: string;
}

export interface Specification {
  id: string;
  productId: string;
  name: string;
  version: string;
  status: SpecificationStatus;
  regions: string[];
  regulatoryGuidelines: string[];
  parameters: SpecificationParameter[];
  linkedTestIds: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface SpecificationContextType {
  specifications: Specification[];
  addSpecification: (spec: Omit<Specification, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateSpecification: (id: string, updates: Partial<Specification>) => void;
  deleteSpecification: (id: string) => void;
  addParameter: (specId: string, parameter: Omit<SpecificationParameter, 'id'>) => string;
  updateParameter: (specId: string, parameterId: string, updates: Partial<SpecificationParameter>) => void;
  deleteParameter: (specId: string, parameterId: string) => void;
  linkTestToParameter: (specId: string, parameterId: string, testId: string) => void;
  unlinkTestFromParameter: (specId: string, parameterId: string, testId: string) => void;
  linkTest: (specId: string, testId: string) => void;
  unlinkTest: (specId: string, testId: string) => void;
}

const SpecificationContext = createContext<SpecificationContextType | undefined>(undefined);

const mockSpecifications: Specification[] = [
  {
    id: 'SPEC-001',
    productId: 'PRD-001',
    name: 'API Quality Control',
    version: '1.0',
    status: 'Active',
    regions: ['US', 'EU'],
    regulatoryGuidelines: ['FDA', 'ICH Q6A'],
    parameters: [
      {
        id: 'PARAM-001',
        name: 'pH',
        type: 'Physical',
        unit: 'pH units',
        expectedValue: '7.0',
        acceptableRange: {
          min: 6.5,
          max: 7.5
        },
        testMethod: 'USP <791>',
        mandatory: true,
        regulatoryReference: 'ICH Q6A 3.3.2',
        linkedTestIds: ['TST-001']
      }
    ],
    linkedTestIds: ['TST-001'],
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    createdBy: 'John Doe'
  }
];

export function SpecificationProvider({ children }: { children: ReactNode }) {
  const [specifications, setSpecifications] = useState<Specification[]>(mockSpecifications);

  const addSpecification = (newSpec: Omit<Specification, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const id = `SPEC-${String(specifications.length + 1).padStart(3, '0')}`;
    
    setSpecifications(prev => [...prev, {
      ...newSpec,
      id,
      createdAt: now,
      updatedAt: now
    }]);
  };

  const updateSpecification = (id: string, updates: Partial<Specification>) => {
    setSpecifications(prev => prev.map(spec => {
      if (spec.id === id) {
        return {
          ...spec,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return spec;
    }));
  };

  const deleteSpecification = (id: string) => {
    setSpecifications(prev => prev.filter(spec => spec.id !== id));
  };

  const addParameter = (specId: string, parameter: Omit<SpecificationParameter, 'id'>): string => {
    let newParameterId = '';
    setSpecifications(prev => prev.map(spec => {
      if (spec.id === specId) {
        const id = `PARAM-${String(spec.parameters.length + 1).padStart(3, '0')}`;
        newParameterId = id;
        return {
          ...spec,
          parameters: [...spec.parameters, { ...parameter, id }],
          updatedAt: new Date().toISOString()
        };
      }
      return spec;
    }));
    
    return newParameterId;
  };

  const updateParameter = (specId: string, parameterId: string, updates: Partial<SpecificationParameter>) => {
    setSpecifications(prev => prev.map(spec => {
      if (spec.id === specId) {
        return {
          ...spec,
          parameters: spec.parameters.map(param => 
            param.id === parameterId ? { ...param, ...updates } : param
          ),
          updatedAt: new Date().toISOString()
        };
      }
      return spec;
    }));
  };

  const deleteParameter = (specId: string, parameterId: string) => {
    setSpecifications(prev => prev.map(spec => {
      if (spec.id === specId) {
        return {
          ...spec,
          parameters: spec.parameters.filter(param => param.id !== parameterId),
          updatedAt: new Date().toISOString()
        };
      }
      return spec;
    }));
  };

  const linkTestToParameter = (specId: string, parameterId: string, testId: string) => {
    setSpecifications(prev => prev.map(spec => {
      if (spec.id === specId) {
        return {
          ...spec,
          parameters: spec.parameters.map(param => {
            if (param.id === parameterId) {
              const linkedTestIds = param.linkedTestIds || [];
              if (!linkedTestIds.includes(testId)) {
                return {
                  ...param,
                  linkedTestIds: [...linkedTestIds, testId]
                };
              }
            }
            return param;
          }),
          updatedAt: new Date().toISOString()
        };
      }
      return spec;
    }));
  };

  const unlinkTestFromParameter = (specId: string, parameterId: string, testId: string) => {
    setSpecifications(prev => prev.map(spec => {
      if (spec.id === specId) {
        return {
          ...spec,
          parameters: spec.parameters.map(param => {
            if (param.id === parameterId && param.linkedTestIds) {
              return {
                ...param,
                linkedTestIds: param.linkedTestIds.filter(id => id !== testId)
              };
            }
            return param;
          }),
          updatedAt: new Date().toISOString()
        };
      }
      return spec;
    }));
  };

  const linkTest = (specId: string, testId: string) => {
    setSpecifications(prev => prev.map(spec => {
      if (spec.id === specId && !spec.linkedTestIds.includes(testId)) {
        return {
          ...spec,
          linkedTestIds: [...spec.linkedTestIds, testId],
          updatedAt: new Date().toISOString()
        };
      }
      return spec;
    }));
  };

  const unlinkTest = (specId: string, testId: string) => {
    setSpecifications(prev => prev.map(spec => {
      if (spec.id === specId) {
        return {
          ...spec,
          linkedTestIds: spec.linkedTestIds.filter(id => id !== testId),
          updatedAt: new Date().toISOString()
        };
      }
      return spec;
    }));
  };

  return (
    <SpecificationContext.Provider value={{
      specifications,
      addSpecification,
      updateSpecification,
      deleteSpecification,
      addParameter,
      updateParameter,
      deleteParameter,
      linkTest,
      unlinkTest,
      linkTestToParameter,
      unlinkTestFromParameter
    }}>
      {children}
    </SpecificationContext.Provider>
  );
}

export function useSpecifications() {
  const context = useContext(SpecificationContext);
  if (context === undefined) {
    throw new Error('useSpecifications must be used within a SpecificationProvider');
  }
  return context;
}