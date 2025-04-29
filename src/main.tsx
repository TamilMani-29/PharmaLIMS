import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import Routes from './Routes.tsx';
import './index.css';
import { SampleProvider } from './context/SampleContext';
import { InventoryProvider } from './context/InventoryContext';
import { EquipmentProvider } from './context/EquipmentContext';
import { TestProvider } from './context/TestContext';
import { ProductProvider } from './context/ProductContext';
import { SpecificationProvider } from './context/SpecificationContext';
import { AuthProvider } from './context/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ProductProvider>
          <SpecificationProvider>
            <SampleProvider>
              <InventoryProvider>
                <EquipmentProvider>
                  <TestProvider>
                    <Routes />
                  </TestProvider>
                </EquipmentProvider>
              </InventoryProvider>
            </SampleProvider>
          </SpecificationProvider>
        </ProductProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
