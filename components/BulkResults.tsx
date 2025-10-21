'use client';

import { VerificationResult } from '@/types';

interface BulkResultItem {
  formIndex: number;
  imageIndex: number;
  brandName: string;
  result: VerificationResult;
  matchedBy: string;
}

interface BulkResultsProps {
  results: BulkResultItem[];
  onReset: () => void;
  onExportCSV: () => void;
}

export default function BulkResults({ results, onReset, onExportCSV }: BulkResultsProps) {
  const passedCount = results.filter(r => r.result.overallMatch).length;
  const failedCount = results.length - passedCount;
  const passRate = results.length > 0 ? (passedCount / results.length * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Summary Stats */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Bulk Verification Results</h2>
        
        <div className="grid sm:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-900">{results.length}</div>
            <div className="text-sm text-gray-600 mt-1">Total Verified</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-success">{passedCount}</div>
            <div className="text-sm text-gray-600 mt-1">Passed</div>
          </div>
          <div className="bg-red-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-error">{failedCount}</div>
            <div className="text-sm text-gray-600 mt-1">Failed</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-primary">{passRate}%</div>
            <div className="text-sm text-gray-600 mt-1">Pass Rate</div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <button
          onClick={onExportCSV}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Results to CSV
        </button>
        <button
          onClick={onReset}
          className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-md"
        >
          Start New Batch
        </button>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Brand Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issues
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Matched By
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.brandName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.result.overallMatch ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        ✓ Passed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        ✗ Failed
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {item.result.discrepancies.length > 0 ? (
                      <div className="text-xs text-gray-600">
                        {item.result.discrepancies.map((d, i) => (
                          <div key={i} className="text-error">• {d}</div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">No issues</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                    {item.matchedBy}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => {
                        // TODO: Show detailed modal
                        alert(`Detailed results for ${item.brandName}\n\nBrand: ${item.result.details.brandName.match ? '✓' : '✗'}\nType: ${item.result.details.productType.match ? '✓' : '✗'}\nABV: ${item.result.details.alcoholContent.match ? '✓' : '✗'}\nVolume: ${item.result.details.netContents.match ? '✓' : '✗'}\nWarning: ${item.result.details.governmentWarning.present ? '✓' : '✗'}`);
                      }}
                      className="text-primary hover:text-primary-dark font-medium"
                    >
                      View →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

