'use client';

import { useState } from 'react';
import TabNavigation from '@/components/TabNavigation';
import LabelForm from '@/components/LabelForm';
import LoadingProgress from '@/components/LoadingProgress';
import VerificationResults from '@/components/VerificationResults';
import BulkUpload from '@/components/BulkUpload';
import BulkResults from '@/components/BulkResults';
import { LabelFormData, VerificationResult } from '@/types';

interface BulkResultItem {
  formIndex: number;
  imageIndex: number;
  brandName: string;
  result: VerificationResult;
  matchedBy: string;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState<'single' | 'bulk'>('single');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [resetKey, setResetKey] = useState(0); // Key to force form reset
  
  // Bulk upload state
  const [bulkResults, setBulkResults] = useState<BulkResultItem[] | null>(null);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 });

  const handleSubmit = async (formData: LabelFormData, imageBase64: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    // Scroll to loading section
    setTimeout(() => {
      const loadingSection = document.getElementById('loading-section');
      if (loadingSection) {
        loadingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formData,
          imageBase64,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      if (data.result) {
        setResult(data.result);
        // Scroll to results
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setError(null);
    setResetKey(prev => prev + 1); // Increment key to force form reset
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBulkVerify = async (
    forms: LabelFormData[],
    images: { name: string; base64: string }[]
  ) => {
    setIsLoading(true);
    setError(null);
    setBulkResults(null);
    setBulkProgress({ current: 0, total: forms.length });

    // Scroll to loading section
    setTimeout(() => {
      const loadingSection = document.getElementById('loading-section');
      if (loadingSection) {
        loadingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);

    try {
      const response = await fetch('/api/bulk-verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ forms, images }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bulk verification failed');
      }

      if (data.results) {
        setBulkResults(data.results);
        // Scroll to results
        setTimeout(() => {
          window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
        }, 100);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
      setBulkProgress({ current: 0, total: 0 });
    }
  };

  const handleBulkReset = () => {
    setBulkResults(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleExportCSV = () => {
    if (!bulkResults) return;

    // Create CSV content
    const headers = ['#', 'Brand Name', 'Status', 'Brand Match', 'Type Match', 'ABV Match', 'Volume Match', 'Warning', 'Matched By'];
    const rows = bulkResults.map((item, index) => [
      index + 1,
      item.brandName,
      item.result.overallMatch ? 'PASSED' : 'FAILED',
      item.result.details.brandName.match ? 'YES' : 'NO',
      item.result.details.productType.match ? 'YES' : 'NO',
      item.result.details.alcoholContent.match ? 'YES' : 'NO',
      item.result.details.netContents.match ? 'YES' : 'NO',
      item.result.details.governmentWarning.present ? 'YES' : 'NO',
      item.matchedBy,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TTB-Bulk-Verification-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      {/* Introduction */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">
          Welcome to TTB Label Verification
        </h2>
        <p className="text-gray-600 mb-4">
          This application simulates the Alcohol and Tobacco Tax and Trade Bureau (TTB) label 
          approval process. Verify single labels or process up to 100 labels in batch mode.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            What We Check:
          </h3>
          <ul className="text-sm text-blue-900 space-y-1 ml-7">
            <li>✓ Brand name matches the label</li>
            <li>✓ Product type/class is correct</li>
            <li>✓ Alcohol content (ABV) matches</li>
            <li>✓ Net contents/volume matches</li>
            <li>✓ Government warning statement is present</li>
          </ul>
        </div>
      </div>

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Single Verification Mode */}
      {activeTab === 'single' && (
        <>
          <LabelForm key={resetKey} onSubmit={handleSubmit} isLoading={isLoading} />

          {/* Loading State */}
          {isLoading && (
            <div id="loading-section">
              <LoadingProgress />
            </div>
          )}

          {/* Results */}
          {result && !isLoading && (
            <VerificationResults result={result} onReset={handleReset} />
          )}
        </>
      )}

      {/* Bulk Verification Mode */}
      {activeTab === 'bulk' && (
        <>
          <BulkUpload onBulkVerify={handleBulkVerify} isProcessing={isLoading} />

          {/* Bulk Loading State */}
          {isLoading && (
            <div id="loading-section">
              <LoadingProgress 
                steps={[
                  'Matching forms to label images...',
                  'Processing batch verification...',
                  `Analyzing ${bulkProgress.total} labels with AI...`,
                  'Comparing all fields...',
                  'Generating results dashboard...'
                ]}
                estimatedTime={bulkProgress.total * 5} // ~5 seconds per label
              />
            </div>
          )}

          {/* Bulk Results */}
          {bulkResults && !isLoading && (
            <BulkResults 
              results={bulkResults} 
              onReset={handleBulkReset}
              onExportCSV={handleExportCSV}
            />
          )}
        </>
      )}

      {/* Error State (shared between modes) */}
      {error && (
        <div className="bg-red-50 border-2 border-error rounded-lg p-6 animate-fade-in">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-error mb-1">
                Error Processing {activeTab === 'bulk' ? 'Batch' : 'Label'}
              </h3>
              <p className="text-red-900">
                {error}
              </p>
              <button
                onClick={activeTab === 'bulk' ? handleBulkReset : handleReset}
                className="mt-4 px-4 py-2 bg-error text-white rounded-md hover:bg-error-dark transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
