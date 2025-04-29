import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ProductStatus = 'not_started' | 'in_progress' | 'completed';

export interface Product {
  id: string;
  name: string;
  description: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt: string;
  sampleIds: string[];
  testIds: string[];
}

interface ProductContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

const mockProducts: Product[] = [
  {
    id: 'PRD-001',
    name: 'Product A',
    description: 'Description for Product A',
    status: 'in_progress',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
    sampleIds: ['SAM-001', 'SAM-002'],
    testIds: ['TST-001']
  },
  {
    id: 'PRD-002',
    name: 'Product B',
    description: 'Description for Product B',
    status: 'not_started',
    createdAt: '2024-03-16T10:00:00Z',
    updatedAt: '2024-03-16T10:00:00Z',
    sampleIds: [],
    testIds: []
  }
];

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(mockProducts);

  const addProduct = (newProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const id = `PRD-${String(products.length + 1).padStart(3, '0')}`;
    
    setProducts(prev => [...prev, {
      ...newProduct,
      id,
      createdAt: now,
      updatedAt: now
    }]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(product => {
      if (product.id === id) {
        return {
          ...product,
          ...updates,
          updatedAt: new Date().toISOString()
        };
      }
      return product;
    }));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  return (
    <ProductContext.Provider value={{
      products,
      addProduct,
      updateProduct,
      deleteProduct
    }}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}