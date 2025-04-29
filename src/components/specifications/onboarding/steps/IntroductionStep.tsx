import React from 'react';
import { ClipboardList, CheckCircle } from 'lucide-react';

interface IntroductionStepProps {
  productName: string;
}

export default function IntroductionStep({ productName }: IntroductionStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
          <ClipboardList className="w-6 h-6 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Create Specifications for {productName}</h2>
          <p className="text-gray-600 text-sm mt-1">
            This guided workflow will help you create comprehensive specifications based on regulatory requirements.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-6 border border-blue-100">
        <h3 className="text-lg font-medium text-blue-900 mb-4">What You'll Need</h3>
        <div className="space-y-3">
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium">Product Information</p>
              <p className="text-blue-700 text-sm">Basic details about your product type and synthesis method</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium">Target Markets</p>
              <p className="text-blue-700 text-sm">Regions where the product will be distributed</p>
            </div>
          </div>
          <div className="flex items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <p className="text-blue-800 font-medium">Quality Attributes</p>
              <p className="text-blue-700 text-sm">Key parameters that need to be tested</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}