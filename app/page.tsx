'use client';

import { useState } from 'react';
import LabelForm from '@/components/LabelForm';
import ImageUpload from '@/components/ImageUpload';
import VerificationResults from '@/components/VerificationResults';
import { LabelFormData, VerificationResult } from '@/types';

export default function Home() {
  const [imageBase64, setImageBase64] = useState<string>('');
  const [analyzedData, setAnalyzedData] = useState<Partial<LabelFormData> | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleImageSelect = (base64: string) => {
    setImageBase64(base64);
    setShowForm(false);
    setAnalyzedData(null);
    setResult(null);
    setError(null);
  };

  const handleImageAnalyzed = (data: Partial<LabelFormData>) => {
    setAnalyzedData(data);
    setShowForm(true);
    // Scroll to form
    setTimeout(() => {
      document.getElementById('form-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSubmit = async (formData: LabelFormData, imageBase64Param: string) => {
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
          imageBase64: imageBase64Param,
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
    setImageBase64('');
    setAnalyzedData(null);
    setShowForm(false);
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
          Start by capturing or uploading a photo of your alcohol beverage label. 
          Our AI will automatically analyze it and pre-fill the form for you to review.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            How it works:
          </h3>
          <ol className="text-sm text-blue-900 space-y-1 ml-7 list-decimal">
            <li>📸 Capture or upload a photo of your label</li>
            <li>🤖 AI analyzes and extracts information</li>
            <li>📝 Review and edit the pre-filled form</li>
            <li>✅ Submit for compliance verification</li>
          </ol>
        </div>
      </div>

      {/* Step 1: Image Upload/Capture */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-bold">1</span>
            Capture or Upload Label Image
          </h3>
          <p className="text-sm text-gray-600 mt-1 ml-10">
            Use your device camera or upload an existing photo
          </p>
        </div>
        <ImageUpload 
          onImageSelect={handleImageSelect}
          onImageAnalyzed={handleImageAnalyzed}
          disabled={isLoading}
          autoAnalyze={true}
        />
      </div>

      {/* Step 2: Review and Edit Form */}
      {showForm && analyzedData && (
        <div id="form-section" className="animate-fade-in">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-bold">2</span>
                Review Detected Information
              </h3>
              <p className="text-sm text-gray-600 mt-1 ml-10">
                AI has pre-filled the form below. Please review and edit if needed.
              </p>
            </div>
            <div className="ml-10 bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div className="text-sm text-green-900">
                  <p className="font-semibold mb-1">Image analyzed successfully!</p>
                  <p>We detected the following information. Please verify accuracy before submitting.</p>
                </div>
              </div>
            </div>
          </div>

          <LabelForm 
            onSubmit={handleSubmit}
            isLoading={isLoading}
            initialValues={analyzedData}
            imageBase64={imageBase64}
          />
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 animate-fade-in">
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-12 w-12 text-primary" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Verifying Label Compliance...
              </h3>
              <div className="space-y-1 text-sm text-gray-600">
                <p>🔍 Comparing form data with label image...</p>
                <p>✅ Checking compliance requirements...</p>
                <p>📊 Generating verification report...</p>
              </div>
              <p className="mt-4 text-xs text-gray-500">
                This may take 5-15 seconds
              </p>
            </div>
          </div>
        </div>
      )}

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
                Start Over
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
