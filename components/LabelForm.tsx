'use client';

import { useState, FormEvent, useEffect } from 'react';
import { LabelFormData } from '@/types';

interface LabelFormProps {
  onSubmit: (formData: LabelFormData, imageBase64: string) => void;
  isLoading: boolean;
  initialValues?: Partial<LabelFormData>;
  imageBase64?: string;
}

export default function LabelForm({ onSubmit, isLoading, initialValues, imageBase64: initialImageBase64 }: LabelFormProps) {
  const [formData, setFormData] = useState<LabelFormData>({
    brandName: initialValues?.brandName || '',
    productType: initialValues?.productType || '',
    alcoholContent: initialValues?.alcoholContent || '',
    netContents: initialValues?.netContents || '',
  });
  
  const [imageBase64, setImageBase64] = useState<string>(initialImageBase64 || '');
  const [errors, setErrors] = useState<Partial<Record<keyof LabelFormData | 'image', string>>>({});

  // Update form when initial values change (from image analysis)
  useEffect(() => {
    if (initialValues) {
      setFormData(prev => ({
        brandName: initialValues.brandName || prev.brandName,
        productType: initialValues.productType || prev.productType,
        alcoholContent: initialValues.alcoholContent || prev.alcoholContent,
        netContents: initialValues.netContents || prev.netContents,
      }));
    }
  }, [initialValues]);

  // Update image when initial image changes
  useEffect(() => {
    if (initialImageBase64) {
      setImageBase64(initialImageBase64);
    }
  }, [initialImageBase64]);

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


  const isFormValid = formData.brandName && formData.productType && 
                     formData.alcoholContent && formData.netContents && imageBase64;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Product Information</h2>
        
        <div className="space-y-5">
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
              Product Class/Type <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="productType"
              value={formData.productType}
              onChange={(e) => handleInputChange('productType', e.target.value)}
              disabled={isLoading}
              placeholder="e.g., Kentucky Straight Bourbon Whiskey, IPA, Cabernet Sauvignon"
              className={`
                w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary
                disabled:bg-gray-100 disabled:cursor-not-allowed
                ${errors.productType ? 'border-error' : 'border-gray-300'}
              `}
            />
            {errors.productType && (
              <p className="mt-1 text-sm text-error">{errors.productType}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              The general class or type of beverage (e.g., spirits designation, beer style, wine varietal)
            </p>
          </div>

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

