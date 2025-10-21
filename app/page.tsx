'use client';

import { useState } from 'react';
import LabelForm from '@/components/LabelForm';
import LoadingProgress from '@/components/LoadingProgress';
import VerificationResults from '@/components/VerificationResults';
import { LabelFormData, VerificationResult } from '@/types';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: LabelFormData, imageBase64: string) => {
    setIsLoading(true);
    setError(null);
    setResult(null);

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
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
          approval process. Enter your product information and upload your label image, and 
          our AI will verify if the label matches the submitted data.
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

      {/* Form */}
      <LabelForm onSubmit={handleSubmit} isLoading={isLoading} />

      {/* Loading State */}
      {isLoading && <LoadingProgress />}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-2 border-error rounded-lg p-6 animate-fade-in">
          <div className="flex items-start gap-3">
            <svg className="w-6 h-6 text-error flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="flex-grow">
              <h3 className="text-lg font-semibold text-error mb-1">
                Error Processing Label
              </h3>
              <p className="text-red-900">
                {error}
              </p>
              <button
                onClick={handleReset}
                className="mt-4 px-4 py-2 bg-error text-white rounded-md hover:bg-error-dark transition-colors text-sm font-medium"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {result && !isLoading && (
        <VerificationResults result={result} onReset={handleReset} />
      )}
    </div>
  );
}
