'use client';

import { useState, FormEvent, useRef } from 'react';
import { LabelFormData, BeverageCategory } from '@/types';
import ImageUpload from './ImageUpload';

interface LabelFormProps {
  onSubmit: (formData: LabelFormData, imageBase64: string) => void;
  isLoading: boolean;
}

export default function LabelForm({ onSubmit, isLoading }: LabelFormProps) {
  const [formData, setFormData] = useState<LabelFormData>({
    beverageCategory: 'spirits',
    brandName: '',
    productType: '',
    alcoholContent: '',
    netContents: '',
    sulfites: '',
    style: '',
  });
  
  const [imageBase64, setImageBase64] = useState<string>('');
  const [errors, setErrors] = useState<Partial<Record<keyof LabelFormData | 'image', string>>>({});
  const [isScanning, setIsScanning] = useState(false);
  const formScanInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LabelFormData | 'image', string>> = {};

    // Validate brand name
    if (!formData.brandName.trim()) {
      newErrors.brandName = 'Brand name is required';
    }

    // Validate product type
    if (!formData.productType.trim()) {
      newErrors.productType = 'Product type is required';
    }

    // Validate alcohol content
    if (!formData.alcoholContent.trim()) {
      newErrors.alcoholContent = 'Alcohol content is required';
    } else {
      const abv = parseFloat(formData.alcoholContent.replace('%', ''));
      if (isNaN(abv) || abv < 0 || abv > 100) {
        newErrors.alcoholContent = 'Please enter a valid percentage (0-100)';
      }
    }

    // Validate net contents
    if (!formData.netContents.trim()) {
      newErrors.netContents = 'Net contents is required';
    }

    // Validate image
    if (!imageBase64) {
      newErrors.image = 'Please upload a label image';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData, imageBase64);
    }
  };

  const handleInputChange = (field: keyof LabelFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageSelect = (base64: string) => {
    setImageBase64(base64);
    if (errors.image) {
      setErrors(prev => ({ ...prev, image: undefined }));
    }
  };

  const handleFormScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    
    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        
        // Call API to scan form
        const response = await fetch('/api/scan-form', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64String }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to scan form');
        }

        if (data.result) {
          // Auto-fill form fields
          setFormData(prev => ({
            ...prev,
            brandName: data.result.brandName || prev.brandName,
            productType: data.result.productType || prev.productType,
            alcoholContent: data.result.alcoholContent || prev.alcoholContent,
            netContents: data.result.netContents || prev.netContents,
          }));
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Form scan error:', err);
      alert(err instanceof Error ? err.message : 'Failed to scan form');
    } finally {
      setIsScanning(false);
    }
  };

  const isFormValid = formData.brandName && formData.productType && 
                     formData.alcoholContent && formData.netContents && imageBase64;

  // Product type options by category
  const getProductTypeOptions = (): string[] => {
    switch (formData.beverageCategory) {
      case 'beer':
      case 'malt-beverages':
        return [
          'IPA (India Pale Ale)',
          'Pale Ale',
          'Lager',
          'Pilsner',
          'Stout',
          'Porter',
          'Wheat Beer',
          'Amber Ale',
          'Brown Ale',
          'Sour Beer',
          'Belgian Ale',
          'Malt Liquor',
        ];
      case 'wine':
        return [
          'Cabernet Sauvignon',
          'Merlot',
          'Pinot Noir',
          'Chardonnay',
          'Sauvignon Blanc',
          'Riesling',
          'Pinot Grigio',
          'Zinfandel',
          'Syrah/Shiraz',
          'Malbec',
          'Champagne/Sparkling Wine',
          'Rosé',
          'Dessert Wine',
          'Table Wine',
        ];
      case 'spirits':
      default:
        return [
          'Bourbon Whiskey',
          'Kentucky Straight Bourbon Whiskey',
          'Tennessee Whiskey',
          'Rye Whiskey',
          'Scotch Whisky',
          'Irish Whiskey',
          'Vodka',
          'Gin',
          'Rum',
          'Tequila',
          'Brandy',
          'Cognac',
          'Liqueur',
          'Moonshine/Unaged Whiskey',
        ];
    }
  };

  // Get field labels based on category
  const getProductTypeLabel = () => {
    switch (formData.beverageCategory) {
      case 'beer':
      case 'malt-beverages':
        return 'Beer Style';
      case 'wine':
        return 'Wine Type/Varietal';
      case 'spirits':
      default:
        return 'Product Class/Type';
    }
  };

  const getProductTypePlaceholder = () => {
    switch (formData.beverageCategory) {
      case 'beer':
      case 'malt-beverages':
        return 'e.g., IPA, Stout, Lager';
      case 'wine':
        return 'e.g., Cabernet Sauvignon, Chardonnay';
      case 'spirits':
      default:
        return 'e.g., Kentucky Straight Bourbon Whiskey, Vodka';
    }
  };

  const [showCustomProductType, setShowCustomProductType] = useState(false);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Product Information</h2>
            <p className="text-xs text-gray-500 mt-1">Fill out manually or use the scan button →</p>
          </div>
          
          {/* Small Scan Form Button */}
          <div className="flex-shrink-0">
            <button
              type="button"
              onClick={() => formScanInputRef.current?.click()}
              disabled={isLoading || isScanning}
              title="Upload a photo of your TTB application form to auto-fill these fields"
              className="text-xs px-3 py-1.5 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 whitespace-nowrap"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              {isScanning ? 'Scanning...' : 'Scan Form'}
            </button>
            <input
              ref={formScanInputRef}
              type="file"
              accept="image/*"
              onChange={handleFormScan}
              disabled={isLoading || isScanning}
              className="hidden"
            />
          </div>
        </div>
        
        {/* Scanning indicator */}
        {isScanning && (
          <div className="mb-4 bg-blue-50 border border-blue-200 rounded-md p-3 flex items-center gap-2 text-sm text-blue-900">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Scanning your TTB application form... This will auto-fill the fields below.
          </div>
        )}
        
        <div className="space-y-5">
          {/* Beverage Category */}
          <div>
            <label htmlFor="beverageCategory" className="block text-sm font-medium text-gray-700 mb-1">
              Beverage Category <span className="text-red-500">*</span>
            </label>
            <select
              id="beverageCategory"
              value={formData.beverageCategory}
              onChange={(e) => handleInputChange('beverageCategory', e.target.value as BeverageCategory)}
              disabled={isLoading}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="spirits">Distilled Spirits</option>
              <option value="wine">Wine</option>
              <option value="beer">Beer</option>
              <option value="malt-beverages">Malt Beverages</option>
            </select>
            <p className="mt-1 text-xs text-gray-500">
              Select the type of alcoholic beverage
            </p>
          </div>

          {/* Brand Name */}
          <div>
            <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-1">
              Brand Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="brandName"
              value={formData.brandName}
              onChange={(e) => handleInputChange('brandName', e.target.value)}
              disabled={isLoading}
              placeholder="e.g., Old Tom Distillery"
              className={`
                w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary
                disabled:bg-gray-100 disabled:cursor-not-allowed
                ${errors.brandName ? 'border-error' : 'border-gray-300'}
              `}
            />
            {errors.brandName && (
              <p className="mt-1 text-sm text-error">{errors.brandName}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              The brand under which the product is sold
            </p>
          </div>

          {/* Product Type */}
          <div>
            <label htmlFor="productType" className="block text-sm font-medium text-gray-700 mb-1">
              {getProductTypeLabel()} <span className="text-red-500">*</span>
            </label>
            
            {!showCustomProductType ? (
              <div className="space-y-2">
                <select
                  id="productType"
                  value={formData.productType}
                  onChange={(e) => {
                    if (e.target.value === '__custom__') {
                      setShowCustomProductType(true);
                      handleInputChange('productType', '');
                    } else {
                      handleInputChange('productType', e.target.value);
                    }
                  }}
                  disabled={isLoading}
                  className={`
                    w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    ${errors.productType ? 'border-error' : 'border-gray-300'}
                  `}
                >
                  <option value="">-- Select {getProductTypeLabel()} --</option>
                  {getProductTypeOptions().map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                  <option value="__custom__" className="font-semibold">
                    ✏️ Custom (Enter Your Own)
                  </option>
                </select>
                {formData.productType && (
                  <button
                    type="button"
                    onClick={() => setShowCustomProductType(true)}
                    className="text-xs text-primary hover:text-primary-dark font-medium"
                  >
                    Switch to custom input →
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="text"
                  id="productTypeCustom"
                  value={formData.productType}
                  onChange={(e) => handleInputChange('productType', e.target.value)}
                  disabled={isLoading}
                  placeholder={getProductTypePlaceholder()}
                  className={`
                    w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary
                    disabled:bg-gray-100 disabled:cursor-not-allowed
                    ${errors.productType ? 'border-error' : 'border-gray-300'}
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowCustomProductType(false)}
                  className="text-xs text-primary hover:text-primary-dark font-medium"
                >
                  ← Back to dropdown selection
                </button>
              </div>
            )}
            
            {errors.productType && (
              <p className="mt-1 text-sm text-error">{errors.productType}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.beverageCategory === 'beer' || formData.beverageCategory === 'malt-beverages'
                ? 'Select from common beer styles or enter your own'
                : formData.beverageCategory === 'wine'
                ? 'Select from common wine types or enter your own'
                : 'Select from common spirit types or enter your own'}
            </p>
          </div>

          {/* Wine-specific: Sulfites Declaration */}
          {(formData.beverageCategory === 'wine') && (
            <div>
              <label htmlFor="sulfites" className="block text-sm font-medium text-gray-700 mb-1">
                Sulfites Declaration
              </label>
              <input
                type="text"
                id="sulfites"
                value={formData.sulfites || ''}
                onChange={(e) => handleInputChange('sulfites', e.target.value)}
                disabled={isLoading}
                placeholder="e.g., Contains Sulfites"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">
                Wine labels typically include &quot;Contains Sulfites&quot; if sulfur dioxide is present
              </p>
            </div>
          )}

          {/* Alcohol Content */}
          <div>
            <label htmlFor="alcoholContent" className="block text-sm font-medium text-gray-700 mb-1">
              Alcohol Content (ABV) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                id="alcoholContent"
                value={formData.alcoholContent}
                onChange={(e) => handleInputChange('alcoholContent', e.target.value)}
                disabled={isLoading}
                placeholder="e.g., 45 or 45%"
                className={`
                  w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary
                  disabled:bg-gray-100 disabled:cursor-not-allowed
                  ${errors.alcoholContent ? 'border-error' : 'border-gray-300'}
                `}
              />
            </div>
            {errors.alcoholContent && (
              <p className="mt-1 text-sm text-error">{errors.alcoholContent}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              Alcohol by volume percentage (enter as number or with %)
            </p>
          </div>

          {/* Net Contents */}
          <div>
            <label htmlFor="netContents" className="block text-sm font-medium text-gray-700 mb-1">
              Net Contents <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="netContents"
              value={formData.netContents}
              onChange={(e) => handleInputChange('netContents', e.target.value)}
              disabled={isLoading}
              placeholder="e.g., 750 mL, 12 fl oz"
              className={`
                w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary
                disabled:bg-gray-100 disabled:cursor-not-allowed
                ${errors.netContents ? 'border-error' : 'border-gray-300'}
              `}
            />
            {errors.netContents && (
              <p className="mt-1 text-sm text-error">{errors.netContents}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              The volume of product (include number and unit)
            </p>
          </div>
        </div>
      </div>

      {/* Image Upload */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <ImageUpload 
          onImageSelect={handleImageSelect}
          disabled={isLoading}
        />
        {errors.image && (
          <p className="mt-2 text-sm text-error">{errors.image}</p>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-center">
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className={`
            px-8 py-3 text-lg font-semibold rounded-lg transition-all shadow-lg
            ${isFormValid && !isLoading
              ? 'bg-primary text-white hover:bg-primary-dark hover:shadow-xl transform hover:-translate-y-0.5'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Verifying Label...
            </span>
          ) : (
            'Verify Label'
          )}
        </button>
      </div>
    </form>
  );
}
