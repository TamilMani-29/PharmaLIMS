import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the types first
type ItemCategory = 'Reagent' | 'Solvent' | 'Standard' | 'Buffer';
type ItemStatus = 'In Use' | 'About to Expire' | 'Expired' | 'About to Deplete' | 'Depleted' | 'Quarantined';
type PackagingType = 'Bottle' | 'Drum' | 'Ampoule' | 'Vial' | 'Box' | 'Bag';
type Unit = 'mL' | 'L' | 'g' | 'kg' | 'mg' | 'µL';

// Export the types and create an enum for ItemCategory
export const ItemCategory = {
  Reagent: 'Reagent' as const,
  Solvent: 'Solvent' as const,
  Standard: 'Standard' as const,
  Buffer: 'Buffer' as const
};

// Export other types
export type { ItemStatus, PackagingType, Unit };

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  category: ItemCategory[keyof typeof ItemCategory];
  casNumber?: string;
  itemCode: string;
  manufacturer: string;
  catalogNumber: string;
  lotNumber: string;
  quantity: number;
  unit: Unit;
  packageSize: string;
  packagingType: PackagingType;
  location: {
    boxId: string;
    rack: string;
    shelf: string;
    drawer?: string;
    freezer: string;
    lab: string;
  };
  dates: {
    received: string;
    expiry: string;
    opened?: string;
  };
  owner: string;
  team?: string;
  status: ItemStatus;
  attachments?: {
    id: string;
    name: string;
    type: string;
    url: string;
  }[];
  notes: {
    id: string;
    content: string;
    timestamp: string;
    user: string;
  }[];
  activityLog: {
    id: string;
    action: string;
    timestamp: string;
    user: string;
    details?: string;
  }[];
}

interface InventoryContextType {
  items: InventoryItem[];
  addItem: (item: Omit<InventoryItem, 'id' | 'notes' | 'activityLog'>) => void;
  updateItem: (id: string, updates: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;
  logUsage: (id: string, quantity: number, note?: string) => void;
  addNote: (id: string, content: string, user: string) => void;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

const mockItems: InventoryItem[] = [
  {
    id: 'INV-001',
    name: 'Sodium Chloride',
    description: 'ACS grade sodium chloride',
    category: 'Reagent',
    casNumber: '7647-14-5',
    itemCode: 'NaCl-001',
    manufacturer: 'Sigma-Aldrich',
    catalogNumber: 'S7653',
    lotNumber: 'MKCD5678',
    quantity: 500,
    unit: 'g',
    packageSize: '500g',
    packagingType: 'Bottle',
    location: {
      boxId: 'BOX-A1',
      rack: 'R1',
      shelf: 'S1',
      freezer: 'F1',
      lab: 'Lab 1'
    },
    dates: {
      received: '2024-03-01',
      expiry: '2025-03-01'
    },
    owner: 'Dr. Sarah Chen',
    team: 'Analytical Chemistry',
    status: 'In Use',
    notes: [],
    activityLog: []
  }
];

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<InventoryItem[]>(mockItems);

  const addItem = (newItem: Omit<InventoryItem, 'id' | 'notes' | 'activityLog'>) => {
    const id = `INV-${String(items.length + 1).padStart(3, '0')}`;
    setItems(prev => [...prev, {
      ...newItem,
      id,
      notes: [],
      activityLog: [{
        id: `ACT-${Date.now()}`,
        action: 'Item Added',
        timestamp: new Date().toISOString(),
        user: 'System',
      }]
    }]);
  };

  const updateItem = (id: string, updates: Partial<InventoryItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...updates,
          activityLog: [
            ...item.activityLog,
            {
              id: `ACT-${Date.now()}`,
              action: 'Item Updated',
              timestamp: new Date().toISOString(),
              user: 'System',
              details: 'Item details updated'
            }
          ]
        };
      }
      return item;
    }));
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const logUsage = (id: string, quantity: number, note?: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        const newQuantity = item.quantity - quantity;
        const status = newQuantity <= 0 ? 'Depleted' :
          newQuantity <= (item.quantity * 0.2) ? 'About to Deplete' :
          item.status;

        return {
          ...item,
          quantity: newQuantity,
          status,
          activityLog: [
            ...item.activityLog,
            {
              id: `ACT-${Date.now()}`,
              action: 'Usage Logged',
              timestamp: new Date().toISOString(),
              user: 'System',
              details: `Used ${quantity} ${item.unit}${note ? ` - ${note}` : ''}`
            }
          ]
        };
      }
      return item;
    }));
  };

  const addNote = (id: string, content: string, user: string) => {
    setItems(prev => prev.map(item => {
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

  return (
    <InventoryContext.Provider value={{ items, addItem, updateItem, deleteItem, logUsage, addNote }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}