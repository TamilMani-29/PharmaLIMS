import React from 'react';
import { Paperclip, FileText } from 'lucide-react';

interface Attachment {
  id: string;
  name: string;
  size: string;
  date: string;
}

interface AttachmentsTabProps {
  attachments: Attachment[];
  onUpload: (files: FileList) => void;
  onDownload: (fileId: string) => void;
}

export default function AttachmentsTab({
  attachments,
  onUpload,
  onDownload,
}: AttachmentsTabProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onUpload(event.target.files);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Section */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          id="file-upload"
          multiple
          onChange={handleFileChange}
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer"
        >
          <Paperclip className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <span className="text-sm font-medium text-blue-600">
            Upload files
          </span>
          <span className="text-sm text-gray-500 block">
            or drag and drop
          </span>
        </label>
      </div>

      {/* Attachments List */}
      {attachments.map((file) => (
        <div
          key={file.id}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
        >
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {file.name}
              </p>
              <p className="text-xs text-gray-500">
                {file.size} • {file.date}
              </p>
            </div>
          </div>
          <button 
            onClick={() => onDownload(file.id)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Download
          </button>
        </div>
      ))}
    </div>
  );
}