import React, { useState } from 'react';
import { 
  BarChart, 
  Calendar, 
  Clock, 
  Download, 
  Filter, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Microscope, 
  Beaker, 
  Package, 
  ClipboardList, 
  ChevronRight,
  ArrowRight,
  Eye
} from 'lucide-react';
import { useTests } from '../../context/TestContext';
import { useSamples } from '../../context/SampleContext';
import { useInventory } from '../../context/InventoryContext';
import { useEquipment } from '../../context/EquipmentContext';
import { useSpecifications } from '../../context/SpecificationContext';
import { useNavigate } from 'react-router-dom';
import ActivityFeed from './sections/ActivityFeed';
import KanbanOverview from './sections/KanbanOverview';
import AlertsSection from './sections/AlertsSection';
import ComplianceSummary from './sections/ComplianceSummary';
import ActionableItems from './sections/ActionableItems';
import CalendarWidget from './sections/CalendarWidget';

interface DashboardProps {
  productId?: string;
}

export default function Dashboard({ productId }: DashboardProps) {
  const navigate = useNavigate();
  const { tests } = useTests();
  const { samples } = useSamples();
  const { items } = useInventory();
  const { equipment } = useEquipment();
  const { specifications } = useSpecifications();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState<{start: string, end: string}>({
    start: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  // Calculate metrics
  const testsInProgress = tests.filter(test => test.status === 'In Progress').length;
  const testsCompletedToday = tests.filter(test => 
    test.status === 'Completed' && 
    new Date(test.createdDate).toDateString() === new Date().toDateString()
  ).length;
  const testsPendingReview = tests.filter(test => 
    test.status === 'Completed' && 
    test.samples.some(sample => sample.status === 'Completed' && !sample.resultStatus)
  ).length;
  
  const samplesReceivedToday = samples.filter(sample => 
    new Date(sample.submissionDate).toDateString() === new Date().toDateString()
  ).length;
  
  const samplesNearingExpiry = samples.filter(sample => {
    // Assuming samples have an expiry date property
    const expiryDate = new Date(sample.submissionDate);
    expiryDate.setDate(expiryDate.getDate() + 30); // Assuming 30-day expiry
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
  }).length;
  
  const inventoryItemsAboutToExpire = items.filter(item => {
    if (!item.dates.expiry) return false;
    const expiryDate = new Date(item.dates.expiry);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
  }).length;
  
  const equipmentDueForCalibration = equipment.filter(item => {
    if (!item.calibration.nextDate) return false;
    const calibrationDate = new Date(item.calibration.nextDate);
    const daysUntilCalibration = Math.ceil((calibrationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilCalibration > 0 && daysUntilCalibration <= 7;
  }).length;
  
  const specificationsFailedThisWeek = specifications.filter(spec => {
    // Check if any linked tests have failed results
    const linkedTests = tests.filter(test => spec.linkedTestIds.includes(test.id));
    return linkedTests.some(test => 
      test.samples.some(sample => 
        sample.resultStatus === 'Fail' && 
        new Date(sample.completedDate || '').getTime() > new Date().getTime() - 7 * 24 * 60 * 60 * 1000
      )
    );
  }).length;

  const handleRefresh = () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const handleExportPDF = () => {
    // Implement PDF export functionality
    console.log('Exporting dashboard as PDF');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Date Range:</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
            />
            <span className="text-sm text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-2 py-1 text-sm border border-gray-300 rounded-lg"
            />
          </div>
          <button
            onClick={handleRefresh}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={handleExportPDF}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </button>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <Beaker className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Tests in Progress</p>
                <h3 className="text-xl font-bold text-gray-900">{testsInProgress}</h3>
              </div>
            </div>
            <div className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
              testsInProgress > 10 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
            }`}>
              {testsInProgress > 10 ? 'High' : 'Normal'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center mr-2">
                <CheckCircle className="w-3.5 h-3.5 text-green-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Tests Completed</p>
                <h3 className="text-xl font-bold text-gray-900">{testsCompletedToday}</h3>
              </div>
            </div>
            <div className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
              {testsCompletedToday > 0 ? `+${testsCompletedToday}` : '0'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-full bg-purple-100 flex items-center justify-center mr-2">
                <TestTube className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Samples Received</p>
                <h3 className="text-xl font-bold text-gray-900">{samplesReceivedToday}</h3>
              </div>
            </div>
            <div className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
              {samplesReceivedToday > 0 ? `+${samplesReceivedToday}` : '0'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center mr-2">
                <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Samples Expiring</p>
                <h3 className="text-xl font-bold text-gray-900">{samplesNearingExpiry}</h3>
              </div>
            </div>
            <div className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
              samplesNearingExpiry > 3 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {samplesNearingExpiry > 3 ? 'Critical' : 'Warning'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center mr-2">
                <Package className="w-3.5 h-3.5 text-red-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Inventory Expiring</p>
                <h3 className="text-xl font-bold text-gray-900">{inventoryItemsAboutToExpire}</h3>
              </div>
            </div>
            <div className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
              inventoryItemsAboutToExpire > 5 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {inventoryItemsAboutToExpire > 5 ? 'Critical' : 'Warning'}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                <Microscope className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Equipment Calibration</p>
                <h3 className="text-xl font-bold text-gray-900">{equipmentDueForCalibration}</h3>
              </div>
            </div>
            <div className={`px-1.5 py-0.5 rounded-full text-xs font-medium ${
              equipmentDueForCalibration > 2 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {equipmentDueForCalibration > 2 ? 'Urgent' : 'Upcoming'}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Test Progress Kanban Overview */}
          <div className="bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Beaker className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Test Progress Overview</h2>
              </div>
            </div>
            <div className="p-6">
              <KanbanOverview />
            </div>
          </div>

          {/* Inventory & Equipment Alerts */}
          <div className="bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Resource Alerts</h2>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Inventory
                </button>
                <button className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Equipment
                </button>
              </div>
            </div>
            <div className="p-6">
              <AlertsSection />
            </div>
          </div>

          {/* Specification Compliance Summary */}
          <div className="bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <ClipboardList className="w-5 h-5 text-green-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Specification Compliance</h2>
              </div>
            </div>
            <div className="p-6">
              <ComplianceSummary />
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Calendar Widget */}
          <div className="bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-purple-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Upcoming Events</h2>
              </div>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto">
              <CalendarWidget />
            </div>
          </div>

          {/* Recent Activity Feed */}
          <div className="bg-white rounded-lg shadow">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <BarChart className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
              </div>
            </div>
            <div className="p-6 max-h-[400px] overflow-y-auto">
              <ActivityFeed />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// TestTube component since it's not available in lucide-react
function TestTube(props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 2v17.5A2.5 2.5 0 0 0 11.5 22v0a2.5 2.5 0 0 0 2.5-2.5V2"></path>
      <path d="M12 2a4 4 0 0 1 4 4"></path>
      <path d="M8 2a4 4 0 0 0-4 4"></path>
      <path d="M7 16h9"></path>
    </svg>
  );
}