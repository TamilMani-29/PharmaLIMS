import React, { useEffect } from 'react';
import { useState } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { 
  Home,
  LayoutDashboard, 
  TestTube2, 
  Microscope, 
  Calendar,
  FlaskConical,
  Beaker,
  Settings,
  Package,
  ChevronDown, 
  ClipboardList,
} from 'lucide-react';
import SampleManagement from './components/samples/SampleManagement';
import SampleDetails from './components/samples/SampleDetails';
import InventoryManagement from './components/inventory/InventoryManagement';
import InventoryDetails from './components/inventory/InventoryDetails';
import EquipmentDetails from './components/equipment/EquipmentDetails';
import EquipmentManagement from './components/equipment/EquipmentManagement';
import TestDetails from './components/tests/TestDetails';
import ParameterTestsView from './components/tests/ParameterTestsView';
import TestMaster from './components/tests/TestMaster';
import SpecificationDetails from './components/specifications/SpecificationDetails';
import SchedulingCalendar from './components/scheduling/SchedulingCalendar';
import SpecificationList from './components/specifications/SpecificationList';
import Dashboard from './components/dashboard/Dashboard';
import Header from './components/layout/Header';

const pages = [
  { id: 'dashboard', name: 'Dashboard', icon: Home },
  { id: 'specifications', name: 'Specifications', icon: ClipboardList },
  { id: 'samples', name: 'Samples', icon: TestTube2 },
  { id: 'inventory', name: 'Inventory', icon: Package },
  { id: 'equipments', name: 'Equipments', icon: Microscope },
  { id: 'tests', name: 'Parameter Tests', icon: Beaker },
  { id: 'test-master', name: 'Test Master', icon: FlaskConical },
  { id: 'scheduling', name: 'Scheduling', icon: Calendar },
  { id: 'settings', name: 'Settings', icon: Settings },
];

interface AppProps {
  productId?: string;
}

function App({ productId }: AppProps) {
  const [activePage, setActivePage] = useState('dashboard');
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (page: string, path: string = '/') => {
    setActivePage(page);
    if (path.startsWith('/inventory/')) {
      navigate(`/products/${productId}${path}`);
    } else {
      navigate(`/products/${productId}${path}`);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header />
      
      {/* Left Sidebar Navigation */}
      <nav className="fixed left-0 top-16 bottom-0 w-20 bg-white border-r border-gray-200">
        <div className="flex flex-col items-center pt-4 space-y-6">
          {pages.map((page) => {
            const Icon = page.icon;
            return (
              <button
                key={page.id}
                onClick={() => handleNavigate(page.id)}
                className={`w-full flex flex-col items-center py-2 px-1 transition-colors
                  ${activePage === page.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-xs mt-1">{page.name}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pl-20 pt-16">
        <Routes>
          <Route 
            path="/"
            element={
              activePage === 'dashboard' ? (
                <Dashboard productId={productId} />
              ) : activePage === 'samples' ? (
                <SampleManagement onSampleClick={(sampleId) => handleNavigate('samples', `/samples/${sampleId}`)} />
              ) : (
                activePage === 'inventory' ? (
                  <InventoryManagement onItemClick={(itemId) => handleNavigate('inventory', `/inventory/${itemId}`)} />
                ) : activePage === 'equipments' ? (
                  <EquipmentManagement onEquipmentClick={(equipmentId) => handleNavigate('equipments', `/equipment/${equipmentId}`)} />
                ) : activePage === 'tests' ? (
                  <ParameterTestsView onTestClick={(testId) => handleNavigate('tests', `/tests/${testId}`)} />
                ) : activePage === 'specifications' ? (
                  <SpecificationList productId={productId} />
                ) : activePage === 'scheduling' ? (
                  <SchedulingCalendar />
                ) : activePage === 'test-master' ? (
                  <TestMaster onTestClick={(testId) => navigate(`/products/${productId}/tests/${testId}`, { state: { fromTestMaster: true } })} />
                ) : (
                  <div className="p-8">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                      {pages.find(p => p.id === activePage)?.name} Page
                    </h2>
                    <p className="text-gray-600">
                      This is the {pages.find(p => p.id === activePage)?.name.toLowerCase()} content area.
                    </p>
                  </div>
                )
              )
            } 
          />
          <Route path="samples/:sampleId" element={<SampleDetails />} />
          <Route path="inventory/:itemId" element={<InventoryDetails />} />
          <Route path="equipment/:equipmentId" element={<EquipmentDetails />} />
          <Route path="tests/:testId" element={<TestDetails />} />
          <Route path="specifications/:specificationId" element={<SpecificationDetails />} />
          <Route path="tests" element={<ParameterTestsView onTestClick={(testId) => handleNavigate('tests', `/tests/${testId}`)} />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;