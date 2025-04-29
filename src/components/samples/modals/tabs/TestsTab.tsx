import React from 'react';
import { Plus, FlaskConical, CheckCircle2, XCircle, Clock3, AlertCircle, Beaker, Eye } from 'lucide-react';
import { Sample, Aliquot, Test } from '../../../../context/SampleContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface TestsTabProps {
  sample: Sample;
  selectedAliquot: Aliquot | null;
  onCreateAliquot: () => void;
  disabled?: boolean;
}

export default function TestsTab({
  sample,
  selectedAliquot, // We'll keep this parameter but won't use it for filtering
  disabled,
}: TestsTabProps) {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Collect all tests from all aliquots
  const allTests = sample.aliquots.flatMap(aliquot => 
    aliquot.tests.map(test => ({
      ...test,
      aliquotId: aliquot.id,
      aliquotVolume: aliquot.volume,
      aliquotLocation: aliquot.location
    }))
  );

  const handleViewTest = (testId: string) => {
    const productId = location.pathname.split('/')[2];
    navigate(`/products/${productId}/tests/${testId}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Tests</h3>
          <p className="text-sm text-gray-500 mt-1">All tests for this sample</p>
        </div>
      </div>

      {allTests.length === 0 ? (
        <div className="text-center py-12">
          <FlaskConical className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tests Added</h3>
          <p className="text-gray-500">This sample has no tests.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200">
            <div className="grid grid-cols-8 gap-4 text-sm font-medium text-gray-500">
              <div>Test ID</div>
              <div>Name</div>
              <div>Aliquot</div>
              <div>Status</div>
              <div>Assigned To</div>
              <div>Start Date</div>
              <div>Results</div>
              <div>Actions</div>
            </div>
          </div>
          <div className="divide-y divide-gray-200">
            {allTests.map((test) => (
              <div
                key={test.id}
                className="px-4 py-3 grid grid-cols-8 gap-4 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-center">
                  <FlaskConical className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-900">{test.id}</span>
                </div>
                <div className="text-sm text-gray-900">
                  {test.name}
                </div>
                <div className="text-sm text-gray-500">
                  <div className="flex items-center">
                    <Beaker className="w-4 h-4 mr-1 text-gray-400" />
                    <span>{test.aliquotId}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {test.aliquotVolume} units • {test.aliquotLocation}
                  </div>
                </div>
                <div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    test.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    test.status === 'Failed' ? 'bg-red-100 text-red-800' :
                    test.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {test.status === 'Completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}
                    {test.status === 'Failed' && <XCircle className="w-3 h-3 mr-1" />}
                    {test.status === 'In Progress' && <Clock3 className="w-3 h-3 mr-1" />}
                    {test.status === 'Pending' && <AlertCircle className="w-3 h-3 mr-1" />}
                    {test.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {test.assignedTo}
                </div>
                <div className="text-sm text-gray-500">
                  {test.startDate}
                </div>
                <div className="text-sm text-gray-500">
                  {test.results || '-'}
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewTest(test.id);
                    }}
                    className="p-1 text-blue-600 hover:text-blue-800 rounded-full hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}