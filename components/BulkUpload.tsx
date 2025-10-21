'use client';

import { useState, useRef } from 'react';
import { LabelFormData } from '@/types';

interface BulkUploadProps {
  onBulkVerify: (forms: LabelFormData[], images: { name: string; base64: string }[]) => void;
  isProcessing: boolean;
}

export default function BulkUpload({ onBulkVerify, isProcessing }: BulkUploadProps) {
  const [forms, setForms] = useState<LabelFormData[]>([]);
  const [images, setImages] = useState<{ name: string; base64: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const formsInputRef = useRef<HTMLInputElement>(null);
  const imagesInputRef = useRef<HTMLInputElement>(null);

  const handleFormsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    try {
      const text = await file.text();
      
      // Parse CSV
      const lines = text.trim().split('\n');
      if (lines.length < 2) {
        throw new Error('CSV must have header row and at least one data row');
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      const parsedForms: LabelFormData[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const form: LabelFormData = {
          brandName: '',
          productType: '',
          alcoholContent: '',
          netContents: '',
        };

        headers.forEach((header, index) => {
          const value = values[index] || '';
          if (header.includes('brand')) form.brandName = value;
          else if (header.includes('type') || header.includes('class')) form.productType = value;
          else if (header.includes('alcohol') || header.includes('abv')) form.alcoholContent = value;
          else if (header.includes('content') || header.includes('volume') || header.includes('net')) form.netContents = value;
        });

        if (form.brandName && form.productType) {
          parsedForms.push(form);
        }
      }

      if (parsedForms.length === 0) {
        throw new Error('No valid forms found in CSV. Ensure headers include: brand name, product type, alcohol content, net contents');
      }

      if (parsedForms.length > 100) {
        throw new Error('Maximum 100 forms allowed. Please reduce your file size.');
      }

      setForms(parsedForms);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse CSV file');
      setForms([]);
    }
  };

  const handleImagesUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setError(null);

    if (files.length > 100) {
      setError('Maximum 100 images allowed. Please select fewer files.');
      return;
    }

    try {
      const imagePromises = files.map(file => {
        return new Promise<{ name: string; base64: string }>((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            resolve({
              name: file.name,
              base64: reader.result as string,
            });
          };
          reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
          reader.readAsDataURL(file);
        });
      });

      const loadedImages = await Promise.all(imagePromises);
      setImages(loadedImages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load images');
      setImages([]);
    }
  };

  const handleSubmit = () => {
    if (forms.length === 0) {
      setError('Please upload a CSV file with form data');
      return;
    }
    if (images.length === 0) {
      setError('Please upload label images');
      return;
    }

    onBulkVerify(forms, images);
  };

  const handleClear = () => {
    setForms([]);
    setImages([]);
    setError(null);
    if (formsInputRef.current) formsInputRef.current.value = '';
    if (imagesInputRef.current) imagesInputRef.current.value = '';
  };

  const isReady = forms.length > 0 && images.length > 0;

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          How Bulk Upload Works:
        </h3>
        <ol className="text-sm text-blue-900 space-y-2 ml-7 list-decimal">
          <li><strong>Upload CSV file</strong> with your form data (brand name, product type, ABV, net contents)</li>
          <li><strong>Upload label images</strong> (up to 100 images)</li>
          <li><strong>AI automatically matches</strong> forms to labels by brand name</li>
          <li><strong>Batch verification</strong> processes all pairs simultaneously</li>
          <li><strong>View results</strong> in a dashboard with pass/fail for each product</li>
          <li><strong>Export results</strong> to CSV or download individual PDF reports</li>
        </ol>
        <div className="mt-3 bg-white border border-blue-300 rounded p-3">
          <p className="text-xs text-blue-900 mb-2">
            <strong>💡 CSV Format:</strong> Headers should include: <code className="bg-blue-100 px-1 rounded">brand name</code>, <code className="bg-blue-100 px-1 rounded">product type</code>, <code className="bg-blue-100 px-1 rounded">alcohol content</code>, <code className="bg-blue-100 px-1 rounded">net contents</code>
          </p>
          <a
            href="/sample-bulk-upload.csv"
            download
            className="text-xs text-blue-700 hover:text-blue-900 underline font-medium"
          >
            📥 Download sample CSV template
          </a>
        </div>
      </div>

      {/* Upload Sections */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Forms Upload */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-bold">1</span>
            Upload Forms (CSV)
          </h3>
          
          <button
            type="button"
            onClick={() => formsInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full py-6 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">
              {forms.length > 0 ? `${forms.length} forms loaded` : 'Click to upload CSV file'}
            </p>
            <p className="text-xs text-gray-500 mt-1">CSV format (up to 100 forms)</p>
          </button>
          <input
            ref={formsInputRef}
            type="file"
            accept=".csv,text/csv"
            onChange={handleFormsUpload}
            disabled={isProcessing}
            className="hidden"
          />

          {forms.length > 0 && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-900">
                ✅ <strong>{forms.length} form{forms.length !== 1 ? 's' : ''}</strong> ready for verification
              </p>
            </div>
          )}
        </div>

        {/* Images Upload */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-bold">2</span>
            Upload Label Images
          </h3>
          
          <button
            type="button"
            onClick={() => imagesInputRef.current?.click()}
            disabled={isProcessing}
            className="w-full py-6 px-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-medium text-gray-700">
              {images.length > 0 ? `${images.length} images loaded` : 'Click to upload label images'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Select multiple images (up to 100)</p>
          </button>
          <input
            ref={imagesInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagesUpload}
            disabled={isProcessing}
            className="hidden"
          />

          {images.length > 0 && (
            <div className="mt-4 bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-900">
                ✅ <strong>{images.length} image{images.length !== 1 ? 's' : ''}</strong> ready for verification
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-900">{error}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        {(forms.length > 0 || images.length > 0) && (
          <button
            type="button"
            onClick={handleClear}
            disabled={isProcessing}
            className="px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear All
          </button>
        )}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isReady || isProcessing}
          className={`
            px-8 py-3 text-lg font-semibold rounded-lg transition-all shadow-lg
            ${isReady && !isProcessing
              ? 'bg-primary text-white hover:bg-primary-dark hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isProcessing ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Processing {forms.length} Labels...
            </span>
          ) : (
            `Verify ${forms.length > 0 ? forms.length : ''} Label${forms.length !== 1 ? 's' : ''}`
          )}
        </button>
      </div>

      {/* Summary */}
      {isReady && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Batch Summary</h3>
          <div className="grid sm:grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-primary">{forms.length}</div>
              <div className="text-sm text-gray-600 mt-1">Forms</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-green-600">{images.length}</div>
              <div className="text-sm text-gray-600 mt-1">Images</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <div className="text-3xl font-bold text-purple-600">{Math.min(forms.length, images.length)}</div>
              <div className="text-sm text-gray-600 mt-1">Will Match</div>
            </div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-4">
            AI will intelligently match forms to labels by brand name, then verify each pair.
          </p>
        </div>
      )}
    </div>
  );
}

