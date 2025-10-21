'use client';

import { useState, FormEvent } from 'react';
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

  const isFormValid = formData.brandName && formData.productType && 
                     formData.alcoholContent && formData.netContents && imageBase64;

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Product Information</h2>
        
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
            <input
              type="text"
              id="productType"
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
            {errors.productType && (
              <p className="mt-1 text-sm text-error">{errors.productType}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.beverageCategory === 'beer' || formData.beverageCategory === 'malt-beverages'
                ? 'The style of beer (e.g., IPA, Stout, Lager)'
                : formData.beverageCategory === 'wine'
                ? 'The type or varietal of wine (e.g., Cabernet Sauvignon, Chardonnay)'
                : 'The class/type designation (e.g., Bourbon, Vodka, Rum)'}
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
