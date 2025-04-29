import React, { useState } from 'react';
import { Download, RefreshCw, CheckCircle, XCircle, Clock, ChevronDown, ChevronRight, Beaker, FileText, Search, Filter, X } from 'lucide-react';
import { useSpecifications } from '../../../context/SpecificationContext';
import { useTests } from '../../../context/TestContext';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface ComplianceReportTabProps {
  specificationId: string;
}

interface ParameterResult {
  parameter: any;
  status: 'Pass' | 'Fail' | 'Pending';
  tests: {
    id: string;
    name: string;
    status: string;
    result?: string;
    resultStatus?: 'Pass' | 'Fail' | 'Inconclusive';
  }[];
  results: { value: string }[];
}

interface FilterState {
  type: string[];
  status: ('Pass' | 'Fail' | 'Pending')[];
  search: string;
}

export default function ComplianceReportTab({ specificationId }: ComplianceReportTabProps) {
  const { specifications } = useSpecifications();
  const { tests } = useTests();
  const [lastEvaluated, setLastEvaluated] = useState<string>(new Date().toISOString());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [expandedParameters, setExpandedParameters] = useState<string[]>([]);
  const [expandedTests, setExpandedTests] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    type: [],
    status: [],
    search: ''
  });

  const specification = specifications.find(s => s.id === specificationId);
  if (!specification) return null;

  // Get all linked tests for this specification
  const linkedTests = tests.filter(test => specification.linkedTestIds.includes(test.id));
  const completedTests = linkedTests.filter(test => test.status === 'Completed');
  
  // Calculate results for parameters
  const parameterResults: ParameterResult[] = specification.parameters.map(param => {
    // Get linked tests for this parameter
    const paramLinkedTestIds = param.linkedTestIds || [];
    
    // If parameter has specific linked tests, use those, otherwise use all linked tests
    const relevantTestIds = paramLinkedTestIds.length > 0 
      ? paramLinkedTestIds 
      : specification.linkedTestIds;
    
    // Get test details
    const paramTests = relevantTestIds.map(testId => {
      const test = tests.find(t => t.id === testId);
      if (!test) return null;
      
      // Find sample results for this test
      const completedSample = test.samples.find(s => s.status === 'Completed' && s.results);
      
      return {
        id: test.id,
        name: test.name,
        status: test.status,
        result: completedSample?.results || undefined,
        resultStatus: completedSample?.resultStatus as 'Pass' | 'Fail' | 'Inconclusive' | undefined
      };
    }).filter(Boolean) as ParameterResult['tests'];
    
    // Check if all relevant tests are completed
    const allTestsCompleted = paramTests.every(test => test.status === 'Completed');
    
    if (!allTestsCompleted) {
      return { 
        parameter: param, 
        status: 'Pending',
        tests: paramTests,
        results: []
      };
    }
    
    // Check if any test failed
    const anyTestFailed = paramTests.some(test => test.resultStatus === 'Fail');
    
    return { 
      parameter: param, 
      status: anyTestFailed ? 'Fail' : 'Pass',
      tests: paramTests,
      results: []
    };
  });
  
  const passingCount = parameterResults.filter(r => r.status === 'Pass').length;
  const failingCount = parameterResults.filter(r => r.status === 'Fail').length;
  const pendingCount = parameterResults.filter(r => r.status === 'Pending').length;
  
  // Determine overall compliance status
  let complianceStatus;
  let statusIcon;
  let statusColor;
  
  if (pendingCount > 0) {
    complianceStatus = 'Incomplete';
    statusIcon = <Clock className="w-6 h-6 text-yellow-500" />;
    statusColor = 'text-yellow-500';
  } else if (failingCount > 0) {
    complianceStatus = 'Non-Compliant';
    statusIcon = <XCircle className="w-6 h-6 text-red-500" />;
    statusColor = 'text-red-500';
  } else {
    complianceStatus = 'Compliant';
    statusIcon = <CheckCircle className="w-6 h-6 text-green-500" />;
    statusColor = 'text-green-500';
  }

  const handleRefreshEvaluation = () => {
    setIsRefreshing(true);
    
    // Simulate refresh delay
    setTimeout(() => {
      setLastEvaluated(new Date().toISOString());
      setIsRefreshing(false);
    }, 1000);
  };

  const toggleParameterExpansion = (parameterId: string) => {
    setExpandedParameters(prev => 
      prev.includes(parameterId)
        ? prev.filter(id => id !== parameterId) 
        : [...prev, parameterId]
    );
  };
  
  const toggleTestExpansion = (testId: string, event: React.MouseEvent) => {
    // Stop propagation to prevent parameter toggle
    event.stopPropagation();
    
    setExpandedTests(prev => 
      prev.includes(testId)
        ? prev.filter(id => id !== testId)
        : [...prev, testId]
    );
  };

  // Function to generate and download PDF report
  const handleDownloadPDF = () => {
    // Create a new PDF document
    const doc = new jsPDF('p', 'mm', 'a4');
    const pageWidth = doc.internal.pageSize.width;
    let yOffset = 20;
    const margin = 14;
    
    // Helper function to add a section title
    const addSectionTitle = (title: string) => {
      doc.setFontSize(16);
      doc.setFont(undefined, 'bold');
      doc.text(title, margin, yOffset);
      yOffset += 8;
      doc.setFont(undefined, 'normal');
    };
    
    // Helper function to add a field
    const addField = (label: string, value: string) => {
      doc.setFontSize(10);
      doc.text(`${label}: `, margin, yOffset);
      doc.setFont(undefined, 'bold');
      doc.text(value, margin + doc.getTextWidth(`${label}: `), yOffset);
      doc.setFont(undefined, 'normal');
      yOffset += 6;
    };
    
    // Title and Header
    doc.setFontSize(20);
    doc.setFont(undefined, 'bold');
    doc.text(`Compliance Report: ${specification.name}`, margin, yOffset);
    yOffset += 12;
    
    // 1. Specification Overview
    addSectionTitle('1. Specification Overview');
    addField('Specification ID', specification.id);
    addField('Version', specification.version);
    addField('Status', specification.status);
    addField('Regions', specification.regions.join(', '));
    addField('Regulatory Guidelines', specification.regulatoryGuidelines.join(', '));
    addField('Created By', specification.createdBy);
    addField('Created At', new Date(specification.createdAt).toLocaleString());
    addField('Last Updated', new Date(specification.updatedAt).toLocaleString());
    yOffset += 8;
    
    // 2. Parameter Details
    addSectionTitle('2. Parameter Details');
    (doc as any).autoTable({
      startY: yOffset,
      head: [['Parameter', 'Type', 'Unit', 'Expected Value', 'Mandatory']],
      body: specification.parameters.map(param => [
        param.name,
        param.type,
        param.unit,
        param.expectedValue,
        param.mandatory ? 'Yes' : 'No'
      ]),
      theme: 'striped',
      headStyles: { fillColor: [66, 133, 244] },
      styles: { fontSize: 9 },
      margin: { left: margin }
    });
    yOffset = (doc as any).lastAutoTable.finalY + 10;
    
    // 3. Test Coverage Summary
    addSectionTitle('3. Test Coverage Summary');
    const coverageData = [
      ['Total Parameters', specification.parameters.length.toString()],
      ['Tests Linked', linkedTests.length.toString()],
      ['Passing Parameters', passingCount.toString()],
      ['Failing Parameters', failingCount.toString()],
      ['Pending Parameters', pendingCount.toString()]
    ];
    
    (doc as any).autoTable({
      startY: yOffset,
      body: coverageData,
      theme: 'plain',
      styles: { fontSize: 10 },
      columnStyles: {
        0: { fontStyle: 'bold' }
      },
      margin: { left: margin }
    });
    yOffset = (doc as any).lastAutoTable.finalY + 10;
    
    // 4. Results Table
    addSectionTitle('4. Results Table');
    
    // Add main results table
    const resultData = parameterResults.flatMap(result => {
      // Main parameter row
      const main = [
        { content: result.parameter.name, styles: { fontStyle: 'bold' } },
        result.parameter.type,
        result.parameter.expectedValue + ' ' + result.parameter.unit,
        { 
          content: result.status,
          styles: { 
            fontStyle: 'bold',
            halign: 'center',
            fillColor: result.status === 'Pass' ? [230, 255, 230] : 
                       result.status === 'Fail' ? [255, 230, 230] : [255, 250, 230]
          }
        }
      ];
      
      // Test detail rows
      const testRows = result.tests.map(test => [
        { content: `  • ${test.id}`, colSpan: 1 },
        { content: test.name, colSpan: 1 },
        { content: test.result || 'No result', colSpan: 1 },
        { 
          content: test.resultStatus || 'Pending',
          styles: { 
            halign: 'center',
            fillColor: test.resultStatus === 'Pass' ? [230, 255, 230] : 
                       test.resultStatus === 'Fail' ? [255, 230, 230] : [255, 250, 230]
          }
        }
      ]);
      
      return [main, ...testRows];
    });
    
    (doc as any).autoTable({
      startY: yOffset,
      head: [['Parameter', 'Type', 'Expected Value', 'Result']],
      body: resultData,
      theme: 'striped',
      headStyles: { fillColor: [66, 133, 244] },
      styles: { fontSize: 9 },
      margin: { left: margin }
    });
    
    // Add compliance status and signature
    yOffset = (doc as any).lastAutoTable.finalY + 15;
    
    // Compliance status
    doc.setFontSize(14);
    doc.text('Overall Compliance Status:', margin, yOffset);
    
    // Set text color based on compliance status using RGB values
    if (complianceStatus === 'Compliant') {
      doc.setTextColor(0, 128, 0); // Green
    } else if (complianceStatus === 'Non-Compliant') {
      doc.setTextColor(255, 0, 0); // Red
    } else {
      doc.setTextColor(255, 165, 0); // Orange
    }
    
    doc.setFont(undefined, 'bold');
    doc.text(complianceStatus, margin + doc.getTextWidth('Overall Compliance Status: '), yOffset);
    doc.setTextColor(0); // Reset text color to black using a single grayscale value
    doc.setFont(undefined, 'normal');
    yOffset += 15;
    
    // Add signature fields
    doc.setFontSize(12);
    doc.text('Reviewed by: _______________________', margin, yOffset);
    yOffset += 10;
    doc.text('Date: _______________________', margin, yOffset);
    yOffset += 10;
    doc.text('Signature: _______________________', margin, yOffset);
    
    // Add footer with evaluation date
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100); // Set gray color using RGB values
      doc.text(
        `Report generated on ${new Date(lastEvaluated).toLocaleString()} | Page ${i} of ${pageCount}`,
        margin, 
        doc.internal.pageSize.height - 10
      );
    }
    
    // Save the PDF
    doc.save(`${specification.name.replace(/\s+/g, '_')}_Compliance_Report.pdf`);
  };

  // Filter parameters based on filters
  const filteredResults = parameterResults.filter(param => {
    const matchesType = filters.type.length === 0 || filters.type.includes(param.parameter.type);
    const matchesStatus = filters.status.length === 0 || filters.status.includes(param.status);
    const matchesSearch = !filters.search || 
      param.parameter.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      param.parameter.testMethod?.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pass':
        return 'bg-green-100 text-green-800';
      case 'Fail':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pass':
        return <CheckCircle className="w-4 h-4" />;
      case 'Fail':
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Test Coverage Summary */}
      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Test Coverage Summary</h2>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(true)}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {(filters.type.length > 0 || filters.status.length > 0) && (
                <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                  {filters.type.length + filters.status.length}
                </span>
              )}
            </button>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="Search parameters..."
                className="pl-9 pr-4 py-2 w-[200px] text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleRefreshEvaluation}
              disabled={isRefreshing}
              className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Evaluation
            </button>
            <button
              onClick={() => handleDownloadPDF()}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF Report
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              {statusIcon}
              <span className={`ml-2 text-2xl font-semibold ${statusColor}`}>
                {complianceStatus}
              </span>
              <span className="ml-3 text-xs text-gray-500">
                Last evaluated: {new Date(lastEvaluated).toLocaleString()}
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-5 gap-4">
            <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
              <span className="text-sm font-medium text-gray-500 mb-1">Total Parameters</span>
              <span className="text-2xl font-bold text-gray-900">{specification.parameters.length}</span>
              <span className="text-xs text-gray-500 mt-1">
                {specification.parameters.filter(p => p.mandatory).length} mandatory
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
              <span className="text-sm font-medium text-gray-500 mb-1">Tests Linked</span>
              <span className="text-2xl font-bold text-gray-900">{linkedTests.length}</span>
              <span className="text-xs text-gray-500 mt-1">
                {completedTests.length} completed
              </span>
            </div>
            <div className="bg-green-50 rounded-lg p-4 flex flex-col">
              <span className="text-sm font-medium text-green-700 mb-1">Passing</span>
              <span className="text-2xl font-bold text-green-600">{passingCount}</span>
              <span className="text-xs text-green-600 mt-1">
                {passingCount > 0 ? Math.round((passingCount / specification.parameters.length) * 100) : 0}% of parameters
              </span>
            </div>
            <div className="bg-red-50 rounded-lg p-4 flex flex-col">
              <span className="text-sm font-medium text-red-700 mb-1">Failing</span>
              <span className="text-2xl font-bold text-red-600">{failingCount}</span>
              <span className="text-xs text-red-600 mt-1">
                {failingCount > 0 ? Math.round((failingCount / specification.parameters.length) * 100) : 0}% of parameters
              </span>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 flex flex-col">
              <span className="text-sm font-medium text-yellow-700 mb-1">Pending</span>
              <span className="text-2xl font-bold text-yellow-600">{pendingCount}</span>
              <span className="text-xs text-yellow-600 mt-1">
                {pendingCount > 0 ? Math.round((pendingCount / specification.parameters.length) * 100) : 0}% of parameters
              </span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Parameters Results Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Parameter Results</h2>
          <p className="text-sm text-gray-500 mt-1">
            Showing {filteredResults.length} of {parameterResults.length} parameters
          </p>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10"></th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Parameter
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expected Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Test Method
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                  Result
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredResults.map((result) => (
                <React.Fragment key={result.parameter.id}>
                  <tr 
                    className={`hover:bg-gray-50 cursor-pointer ${expandedParameters.includes(result.parameter.id) ? 'bg-gray-50' : ''}`}
                    onClick={() => toggleParameterExpansion(result.parameter.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button className="text-gray-500 hover:text-gray-700">
                        {expandedParameters.includes(result.parameter.id) ? 
                          <ChevronDown className="w-5 h-5" /> : 
                          <ChevronRight className="w-5 h-5" />
                        }
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{result.parameter.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-24">
                      <div className="text-sm text-gray-500">{result.parameter.type}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {result.parameter.expectedValue} {result.parameter.unit}
                        {result.parameter.acceptableRange && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({result.parameter.acceptableRange.min} - {result.parameter.acceptableRange.max})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {result.parameter.testMethod || '-'}
                        {result.parameter.mandatory && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded-full">
                            Required
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap w-24">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(result.status)}`}>
                        {getStatusIcon(result.status)}
                        <span className="ml-1">{result.status}</span>
                      </span>
                    </td>
                  </tr>
                  
                  {/* Expanded Test Details */}
                  {expandedParameters.includes(result.parameter.id) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                        <div className="border rounded-lg overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-100">
                              <tr>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Test ID
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Test Name
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                                  Status
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                                  Result
                                </th>
                                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-28">
                                  Status
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {(result.tests || []).map(test => (
                                <React.Fragment key={test.id}>
                                  <tr 
                                    className={`hover:bg-gray-50 cursor-pointer ${expandedTests.includes(test.id) ? 'bg-gray-50' : ''}`}
                                    onClick={(e) => toggleTestExpansion(test.id, e)}
                                  >
                                    <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                      <div className="flex items-center">
                                        {expandedTests.includes(test.id) ? 
                                          <ChevronDown className="w-4 h-4 text-gray-500 mr-1" /> : 
                                          <ChevronRight className="w-4 h-4 text-gray-500 mr-1" />
                                        }
                                        {test.id}
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                      <div className="flex items-center">
                                        <Beaker className="w-4 h-4 text-gray-400 mr-2" />
                                        {test.name}
                                      </div>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap w-24">
                                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                        test.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                        test.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {test.status}
                                      </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                                      {test.result || 'No result'}
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap w-28">
                                      {test.resultStatus ? (
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          test.resultStatus === 'Pass' ? 'bg-green-100 text-green-800' :
                                          test.resultStatus === 'Fail' ? 'bg-red-100 text-red-800' :
                                          'bg-yellow-100 text-yellow-800'
                                        }`}>
                                          {test.resultStatus}
                                        </span>
                                      ) : (
                                        <span className="text-sm text-gray-500">Pending</span>
                                      )}
                                    </td>
                                  </tr>
                                  
                                  {expandedTests.includes(test.id) && (
                                    <tr>
                                      <td colSpan={5} className="px-0 py-0 bg-gray-50">
                                        {(() => {
                                          // Get the full test data from the tests context
                                          const fullTest = tests.find(t => t.id === test.id);
                                          
                                          if (!fullTest || !fullTest.samples || fullTest.samples.length === 0) {
                                            return (
                                              <div className="ml-8 mr-4 my-2 p-4 text-center text-sm text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                                                No samples available for this test
                                              </div>
                                            );
                                          }
                                          
                                          return (
                                            <div className="ml-8 mr-4 my-2 border rounded-lg overflow-hidden">
                                              <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-blue-50">
                                                  <tr>
                                                    <th scope="col" className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                      Sample ID
                                                    </th>
                                                    <th scope="col" className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                      Sample Name
                                                    </th>
                                                    <th scope="col" className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                      Status
                                                    </th>
                                                    <th scope="col" className="px-3 py-1.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                      Result
                                                    </th>
                                                  </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                  {fullTest.samples.map(sample => (
                                                    <tr key={sample.sampleId}>
                                                      <td className="px-3 py-1.5 whitespace-nowrap text-xs font-medium text-gray-900">
                                                        {sample.sampleId}
                                                      </td>
                                                      <td className="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">
                                                        {sample.sampleName}
                                                      </td>
                                                      <td className="px-3 py-1.5 whitespace-nowrap">
                                                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                                          sample.status === 'Completed' ? 'bg-green-100 text-green-800' :
                                                          sample.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                                                          'bg-gray-100 text-gray-800'
                                                        }`}>
                                                          {sample.status}
                                                        </span>
                                                      </td>
                                                      <td className="px-3 py-1.5 whitespace-nowrap text-xs text-gray-500">
                                                        {sample.results || 'No result'}
                                                        {sample.resultStatus && (
                                                          <span className={`ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                                            sample.resultStatus === 'Pass' ? 'bg-green-100 text-green-800' :
                                                            sample.resultStatus === 'Fail' ? 'bg-red-100 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'
                                                          }`}>
                                                            {sample.resultStatus}
                                                          </span>
                                                        )}
                                                      </td>
                                                    </tr>
                                                  ))}
                                                </tbody>
                                              </table>
                                            </div>
                                          );
                                        })()}
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Filters Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center pt-20 z-50">
          <div className="bg-white rounded-lg shadow-xl w-[500px]">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Filter Results</h2>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Parameter Type Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Parameter Type</h3>
                <div className="grid grid-cols-2 gap-3">
                  {['Physical', 'Chemical', 'Microbial', 'Performance', 'Stability'].map(type => (
                    <label
                      key={type}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        filters.type.includes(type)
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.type.includes(type)}
                        onChange={(e) => {
                          const newTypes = e.target.checked
                            ? [...filters.type, type]
                            : filters.type.filter(t => t !== type);
                          setFilters(prev => ({ ...prev, type: newTypes }));
                        }}
                        className="sr-only"
                      />
                      <span className={`text-sm ${
                        filters.type.includes(type) ? 'text-blue-900' : 'text-gray-600'
                      }`}>{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-4">Result Status</h3>
                <div className="grid grid-cols-3 gap-3">
                  {['Pass', 'Fail', 'Pending'].map(status => (
                    <label
                      key={status}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        filters.status.includes(status as 'Pass' | 'Fail' | 'Pending')
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:border-blue-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={filters.status.includes(status as 'Pass' | 'Fail' | 'Pending')}
                        onChange={(e) => {
                          const newStatus = e.target.checked
                            ? [...filters.status, status as 'Pass' | 'Fail' | 'Pending']
                            : filters.status.filter(s => s !== status);
                          setFilters(prev => ({ ...prev, status: newStatus }));
                        }}
                        className="sr-only"
                      />
                      <span className={`text-sm ${
                        filters.status.includes(status as 'Pass' | 'Fail' | 'Pending') ? 'text-blue-900' : 'text-gray-600'
                      }`}>{status}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end px-6 py-4 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setFilters({
                    type: [],
                    status: [],
                    search: ''
                  });
                  setShowFilters(false);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500 mr-3"
              >
                Reset
              </button>
              <button
                onClick={() => setShowFilters(false)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}