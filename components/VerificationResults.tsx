'use client';

import { VerificationResult } from '@/types';

interface VerificationResultsProps {
  result: VerificationResult;
  onReset: () => void;
}

export default function VerificationResults({ result, onReset }: VerificationResultsProps) {
  const { overallMatch, details, discrepancies } = result;

  return (
    <div className="mt-8 animate-fade-in">
      {/* Overall Status Banner */}
      <div
        className={`
          rounded-lg p-6 mb-6 border-2
          ${overallMatch 
            ? 'bg-green-50 border-success text-green-900' 
            : 'bg-red-50 border-error text-red-900'
          }
        `}
      >
        <div className="flex items-center gap-3">
          {overallMatch ? (
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <div>
            <h2 className="text-2xl font-bold">
              {overallMatch ? '✅ Label Verified Successfully!' : '❌ Label Verification Failed'}
            </h2>
            <p className="text-sm mt-1">
              {overallMatch 
                ? 'All information on the label matches the form data.' 
                : `${discrepancies.length} ${discrepancies.length === 1 ? 'discrepancy' : 'discrepancies'} found.`
              }
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Results */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Verification Details</h3>
          
          <div className="space-y-4">
            {/* Brand Name */}
            <ResultItem
              label="Brand Name"
              match={details.brandName.match}
              expected={details.brandName.expected}
              found={details.brandName.found}
              confidence={details.brandName.confidence}
            />

            {/* Product Type */}
            <ResultItem
              label="Product Type"
              match={details.productType.match}
              expected={details.productType.expected}
              found={details.productType.found}
              confidence={details.productType.confidence}
            />

            {/* Alcohol Content */}
            <ResultItem
              label="Alcohol Content"
              match={details.alcoholContent.match}
              expected={details.alcoholContent.expected}
              found={details.alcoholContent.found}
              confidence={details.alcoholContent.confidence}
            />

            {/* Net Contents */}
            <ResultItem
              label="Net Contents"
              match={details.netContents.match}
              expected={details.netContents.expected}
              found={details.netContents.found}
              confidence={details.netContents.confidence}
            />

            {/* Government Warning */}
            <div className="flex items-start gap-3 p-4 border rounded-lg">
              <div className="flex-shrink-0 mt-0.5">
                {details.governmentWarning.present ? (
                  <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="flex-grow">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium text-gray-900">Government Warning</span>
                  <span className={`text-sm font-semibold ${details.governmentWarning.present ? 'text-success' : 'text-error'}`}>
                    {details.governmentWarning.present ? 'Present' : 'Missing'}
                  </span>
                  {details.governmentWarning.exact && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      ✓ TTB-Compliant
                    </span>
                  )}
                  {details.governmentWarning.confidence !== undefined && (
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      details.governmentWarning.confidence >= 90 ? 'bg-green-100 text-green-800' :
                      details.governmentWarning.confidence >= 70 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {details.governmentWarning.confidence}% confidence
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {details.governmentWarning.text || (details.governmentWarning.present 
                    ? 'Required government warning statement was found on the label.'
                    : 'Required government warning statement is missing from the label.'
                  )}
                </p>
                {details.governmentWarning.missingPhrases && details.governmentWarning.missingPhrases.length > 0 && (
                  <div className="mt-2 text-sm text-error">
                    <p className="font-medium">Missing required phrases:</p>
                    <ul className="list-disc list-inside mt-1">
                      {details.governmentWarning.missingPhrases.map((phrase, idx) => (
                        <li key={idx}>{phrase}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-6 text-center">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark transition-colors shadow-md"
        >
          Verify Another Label
        </button>
      </div>
    </div>
  );
}

interface ResultItemProps {
  label: string;
  match: boolean;
  expected: string;
  found: string | null;
  confidence?: number;
}

function ResultItem({ label, match, expected, found, confidence }: ResultItemProps) {
  return (
    <div className="flex items-start gap-3 p-4 border rounded-lg">
      <div className="flex-shrink-0 mt-0.5">
        {match ? (
          <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-error" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )}
      </div>
      <div className="flex-grow">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-gray-900">{label}</span>
          <span className={`text-sm font-semibold ${match ? 'text-success' : 'text-error'}`}>
            {match ? 'Match' : 'Mismatch'}
          </span>
          {confidence !== undefined && (
            <span className={`text-xs px-2 py-0.5 rounded ${
              confidence >= 90 ? 'bg-green-100 text-green-800' :
              confidence >= 70 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {confidence}% confidence
            </span>
          )}
        </div>
        <div className="mt-2 text-sm space-y-1">
          <div>
            <span className="text-gray-600">Expected: </span>
            <span className="font-mono text-gray-900">{expected}</span>
          </div>
          <div>
            <span className="text-gray-600">Found: </span>
            <span className={`font-mono ${found ? 'text-gray-900' : 'text-error'}`}>
              {found || 'Not found on label'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

