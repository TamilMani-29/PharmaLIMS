import React from 'react';
import { AlertCircle, CheckCircle, Clock, XCircle, Trash2, CheckSquare, XSquare, HelpCircle } from 'lucide-react';
import { SampleTest } from '../../../context/TestContext';

interface SamplesListProps {
  samples: SampleTest[];
  onSampleClick: (sampleId: string) => void;
  onRemoveSample: (sampleId: string) => void;
  assignedTo?: string;
}

export default function SamplesList({ 
  samples, 
  onSampleClick, 
  onRemoveSample,
  assignedTo 
}: SamplesListProps) {
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [sampleToDelete, setSampleToDelete] = React.useState<string | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Not Started':
        return 'bg-gray-100 text-gray-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Completed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Not Started':
        return <Clock className="w-4 h-4" />;
      case 'In Progress':
        return <AlertCircle className="w-4 h-4" />;
      case 'Completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  const getResultStatusColor = (status: string) => {
    switch (status) {
      case 'Pass':
        return 'text-green-600';
      case 'Fail':
        return 'text-red-600';
      default:
        return 'text-yellow-600';
    }
  };

  const getResultStatusIcon = (status: string) => {
    switch (status) {
      case 'Pass':
        return <CheckSquare className="w-3 h-3 mr-1" />;
      case 'Fail':
        return <XSquare className="w-3 h-3 mr-1" />;
      default:
        return <HelpCircle className="w-3 h-3 mr-1" />;
    }
  };

  const handleDeleteClick = (e: React.MouseEvent, sampleId: string) => {
    e.stopPropagation();
    setSampleToDelete(sampleId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (sampleToDelete) {
      onRemoveSample(sampleToDelete);
      setShowDeleteModal(false);
      setSampleToDelete(null);
    }
  };

  return (
    <>
    <div className="bg-white rounded-lg border border-gray-200">
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="grid grid-cols-6 gap-4 text-sm font-medium text-gray-500">
          <div>Sample ID</div>
          <div>Sample Name</div>
          <div>Assigned To</div>
          <div>Status</div>
          <div>Results</div>
          <div>Progress</div>
        </div>
      </div>
      <div className="divide-y divide-gray-200">
        {samples.map((sample) => (
          <div
            key={sample.sampleId}
            className="px-4 py-3 grid grid-cols-6 gap-4 hover:bg-gray-50 cursor-pointer"
            onClick={() => onSampleClick(sample.sampleId)}
          >
            <div className="text-sm font-medium text-gray-900 col-span-1">
              {sample.sampleId}
            </div>
            <div className="text-sm text-gray-500 col-span-1">
              {sample.sampleName}
            </div>
            <div className="text-sm text-gray-500 col-span-1">
              {assignedTo ? (
                <span>{assignedTo}</span>
              ) : (
                <span className="text-gray-400">Not assigned</span>
              )}
            </div>
            <div className="col-span-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(sample.status)}`}>
                {getStatusIcon(sample.status)}
                <span className="ml-1">{sample.status}</span>
              </span>
            </div>
            <div className="col-span-1">
              {sample.results ? (
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 mr-2">{sample.results}</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    sample.resultStatus === 'Pass' ? 'bg-green-100 text-green-800' : 
                    sample.resultStatus === 'Fail' ? 'bg-red-100 text-red-800' : 
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {getResultStatusIcon(sample.resultStatus || 'Pending')}
                    {sample.resultStatus || 'Pending'}
                  </span>
                </div>
              ) : (
                <span className="text-sm text-gray-500">No results</span>
              )}
            </div>
            <div className="flex items-center col-span-1">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-600 rounded-full"
                  style={{
                    width: `${(sample.steps.filter(step => step.status === 'Complete').length / sample.steps.length) * 100}%` 
                  }}
                />
              </div>
              <span className="ml-2 text-sm text-gray-500 whitespace-nowrap">
                {sample.steps.filter(step => step.status === 'Complete').length}/{sample.steps.length} steps
              </span>
              <button
                onClick={(e) => handleDeleteClick(e, sample.sampleId)}
                className="ml-2 text-red-500 hover:text-red-700 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Delete Confirmation Modal */}
    {showDeleteModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-[400px]">
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-lg font-medium text-gray-900">Remove Sample</h3>
              <p className="mt-2 text-sm text-gray-500">
                Are you sure you want to remove this sample from the test? This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSampleToDelete(null);
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 mr-3"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}