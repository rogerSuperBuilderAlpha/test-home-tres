'use client';

import { useState } from 'react';
import { VerificationResult } from '@/types';
import jsPDF from 'jspdf';

interface VerificationResultsProps {
  result: VerificationResult;
  onReset: () => void;
}

export default function VerificationResults({ result, onReset }: VerificationResultsProps) {
  const { overallMatch, details, discrepancies } = result;
  
  // Track manual overrides
  const [overrides, setOverrides] = useState<{
    brandName?: boolean;
    productType?: boolean;
    alcoholContent?: boolean;
    netContents?: boolean;
    governmentWarning?: boolean;
  }>({});
  
  const [showOverrideMode, setShowOverrideMode] = useState(false);

  // Calculate effective results with overrides
  const getEffectiveMatch = (field: keyof typeof overrides, originalMatch: boolean) => {
    return overrides[field] !== undefined ? overrides[field] : originalMatch;
  };

  const effectiveBrandMatch = getEffectiveMatch('brandName', details.brandName.match);
  const effectiveTypeMatch = getEffectiveMatch('productType', details.productType.match);
  const effectiveAlcoholMatch = getEffectiveMatch('alcoholContent', details.alcoholContent.match);
  const effectiveVolumeMatch = getEffectiveMatch('netContents', details.netContents.match);
  const effectiveWarningMatch = getEffectiveMatch('governmentWarning', details.governmentWarning.present);

  const effectiveOverallMatch = effectiveBrandMatch && effectiveTypeMatch && 
                                effectiveAlcoholMatch && effectiveVolumeMatch && effectiveWarningMatch;

  const hasOverrides = Object.keys(overrides).length > 0;

  const toggleOverride = (field: keyof typeof overrides, currentMatch: boolean) => {
    setOverrides(prev => {
      const newOverrides = { ...prev };
      if (newOverrides[field] !== undefined) {
        // Remove override if already set
        delete newOverrides[field];
      } else {
        // Add override (flip the current state)
        newOverrides[field] = !currentMatch;
      }
      return newOverrides;
    });
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text('TTB Label Verification Report', pageWidth / 2, y, { align: 'center' });
    y += 10;

    // Date
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Overall Result (use effective match if overrides exist)
    const pdfOverallMatch = hasOverrides ? effectiveOverallMatch : overallMatch;
    
    doc.setFontSize(16);
    if (pdfOverallMatch) {
      doc.setTextColor(16, 185, 129); // Green
      doc.text('✓ VERIFICATION PASSED', pageWidth / 2, y, { align: 'center' });
    } else {
      doc.setTextColor(239, 68, 68); // Red
      doc.text('✗ VERIFICATION FAILED', pageWidth / 2, y, { align: 'center' });
    }
    y += 10;

    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text(
      pdfOverallMatch 
        ? 'All information on the label matches the form data.'
        : `${discrepancies.length} discrepancy(ies) found.`,
      pageWidth / 2,
      y,
      { align: 'center' }
    );
    
    if (hasOverrides) {
      y += 6;
      doc.setTextColor(255, 153, 0); // Orange
      doc.setFontSize(9);
      doc.text('⚠ Contains manual overrides - see details below', pageWidth / 2, y, { align: 'center' });
    }
    
    y += 15;

    // Divider line
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    // Verification Details
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Verification Details', 20, y);
    y += 10;

    // Helper function to add field
    const addField = (
      label: string, 
      match: boolean, 
      expected: string, 
      found: string | null, 
      confidence?: number,
      overridden?: boolean,
      effectiveMatch?: boolean
    ) => {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      
      const displayMatch = effectiveMatch !== undefined ? effectiveMatch : match;
      
      if (displayMatch) {
        doc.setTextColor(16, 185, 129);
        doc.text('✓', 20, y);
      } else {
        doc.setTextColor(239, 68, 68);
        doc.text('✗', 20, y);
      }
      
      doc.setTextColor(0, 0, 0);
      doc.text(label, 30, y);
      
      if (overridden) {
        doc.setFontSize(8);
        doc.setTextColor(255, 153, 0);
        doc.text('[MANUALLY OVERRIDDEN]', 100, y);
      } else if (confidence !== undefined) {
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`(${confidence}% confidence)`, 100, y);
      }
      
      y += 6;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`Expected: ${expected}`, 30, y);
      y += 5;
      doc.text(`Found: ${found || 'Not found on label'}`, 30, y);
      
      if (overridden) {
        y += 5;
        doc.setTextColor(255, 153, 0);
        doc.text(`Note: AI found mismatch, manually approved by reviewer`, 30, y);
      }
      
      y += 8;
    };

    // Brand Name
    addField(
      'Brand Name',
      details.brandName.match,
      details.brandName.expected,
      details.brandName.found,
      details.brandName.confidence,
      overrides.brandName !== undefined,
      effectiveBrandMatch
    );

    // Product Type
    addField(
      'Product Type',
      details.productType.match,
      details.productType.expected,
      details.productType.found,
      details.productType.confidence,
      overrides.productType !== undefined,
      effectiveTypeMatch
    );

    // Alcohol Content
    addField(
      'Alcohol Content',
      details.alcoholContent.match,
      details.alcoholContent.expected,
      details.alcoholContent.found,
      details.alcoholContent.confidence,
      overrides.alcoholContent !== undefined,
      effectiveAlcoholMatch
    );

    // Net Contents
    addField(
      'Net Contents',
      details.netContents.match,
      details.netContents.expected,
      details.netContents.found,
      details.netContents.confidence,
      overrides.netContents !== undefined,
      effectiveVolumeMatch
    );

    // Government Warning
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    if (details.governmentWarning.present) {
      doc.setTextColor(16, 185, 129);
      doc.text('✓', 20, y);
    } else {
      doc.setTextColor(239, 68, 68);
      doc.text('✗', 20, y);
    }
    
    doc.setTextColor(0, 0, 0);
    doc.text('Government Warning', 30, y);
    
    if (details.governmentWarning.confidence !== undefined) {
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text(`(${details.governmentWarning.confidence}% confidence)`, 110, y);
    }
    
    y += 6;
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(
      details.governmentWarning.text || (details.governmentWarning.present ? 'Present' : 'Missing'),
      30,
      y,
      { maxWidth: pageWidth - 50 }
    );
    
    if (details.governmentWarning.exact) {
      y += 5;
      doc.setTextColor(16, 185, 129);
      doc.text('✓ Exact TTB-compliant warning text', 30, y);
    }
    
    if (details.governmentWarning.missingPhrases && details.governmentWarning.missingPhrases.length > 0) {
      y += 5;
      doc.setTextColor(239, 68, 68);
      doc.text('Missing phrases:', 30, y);
      y += 5;
      details.governmentWarning.missingPhrases.forEach(phrase => {
        doc.text(`• ${phrase}`, 35, y);
        y += 4;
      });
    }

    y += 10;

    // Footer
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);
    y += 7;
    
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text('TTB Label Verification System', 20, y);
    doc.text('AI-Powered Label Compliance Checker', 20, y + 4);
    doc.text('This report was generated automatically using OCR and AI verification.', 20, y + 8);

    // Save the PDF
    const filename = `TTB-Verification-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="mt-8 animate-fade-in">
      {/* Overall Status Banner (with overrides) */}
      <div
        className={`
          rounded-lg p-6 mb-6 border-2
          ${effectiveOverallMatch 
            ? 'bg-green-50 border-success text-green-900' 
            : 'bg-red-50 border-error text-red-900'
          }
        `}
      >
        <div className="flex items-center gap-3">
          {effectiveOverallMatch ? (
            <svg className="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ) : (
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <div className="flex-grow">
            <h2 className="text-2xl font-bold">
              {effectiveOverallMatch ? '✅ Label Verified Successfully!' : '❌ Label Verification Failed'}
              {hasOverrides && (
                <span className="ml-3 text-sm font-normal text-orange-600">
                  (with manual overrides)
                </span>
              )}
            </h2>
            <p className="text-sm mt-1">
              {effectiveOverallMatch 
                ? hasOverrides 
                  ? 'Verification passed with manual reviewer approval.'
                  : 'All information on the label matches the form data.'
                : `${discrepancies.length} ${discrepancies.length === 1 ? 'discrepancy' : 'discrepancies'} found.`
              }
            </p>
          </div>
          {!overallMatch && (
            <button
              onClick={() => setShowOverrideMode(!showOverrideMode)}
              className="px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              {showOverrideMode ? 'Hide Override Options' : 'Manual Review'}
            </button>
          )}
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
              overridden={overrides.brandName !== undefined}
              effectiveMatch={effectiveBrandMatch}
              onOverride={() => toggleOverride('brandName', details.brandName.match)}
              showOverrideButton={showOverrideMode}
            />

            {/* Product Type */}
            <ResultItem
              label="Product Type"
              match={details.productType.match}
              expected={details.productType.expected}
              found={details.productType.found}
              confidence={details.productType.confidence}
              overridden={overrides.productType !== undefined}
              effectiveMatch={effectiveTypeMatch}
              onOverride={() => toggleOverride('productType', details.productType.match)}
              showOverrideButton={showOverrideMode}
            />

            {/* Alcohol Content */}
            <ResultItem
              label="Alcohol Content"
              match={details.alcoholContent.match}
              expected={details.alcoholContent.expected}
              found={details.alcoholContent.found}
              confidence={details.alcoholContent.confidence}
              overridden={overrides.alcoholContent !== undefined}
              effectiveMatch={effectiveAlcoholMatch}
              onOverride={() => toggleOverride('alcoholContent', details.alcoholContent.match)}
              showOverrideButton={showOverrideMode}
            />

            {/* Net Contents */}
            <ResultItem
              label="Net Contents"
              match={details.netContents.match}
              expected={details.netContents.expected}
              found={details.netContents.found}
              confidence={details.netContents.confidence}
              overridden={overrides.netContents !== undefined}
              effectiveMatch={effectiveVolumeMatch}
              onOverride={() => toggleOverride('netContents', details.netContents.match)}
              showOverrideButton={showOverrideMode}
            />

            {/* Government Warning */}
            <div className={`flex items-start gap-3 p-4 border-2 rounded-lg ${overrides.governmentWarning !== undefined ? 'border-warning bg-orange-50' : 'border-gray-200'}`}>
              <div className="flex-shrink-0 mt-0.5">
                {effectiveWarningMatch ? (
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
                  <span className={`text-sm font-semibold ${effectiveWarningMatch ? 'text-success' : 'text-error'}`}>
                    {effectiveWarningMatch ? 'Present' : 'Missing'}
                  </span>
                  {overrides.governmentWarning !== undefined && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                      👤 Manually Overridden
                    </span>
                  )}
                  {overrides.governmentWarning === undefined && details.governmentWarning.exact && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      ✓ TTB-Compliant
                    </span>
                  )}
                  {overrides.governmentWarning === undefined && details.governmentWarning.confidence !== undefined && (
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
                
                {/* Override button for warning */}
                {showOverrideMode && (
                  <div className="mt-3">
                    <button
                      onClick={() => toggleOverride('governmentWarning', details.governmentWarning.present)}
                      className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                        overrides.governmentWarning !== undefined
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-warning text-white hover:bg-warning-dark'
                      }`}
                    >
                      {overrides.governmentWarning !== undefined 
                        ? '↩ Remove Override' 
                        : effectiveWarningMatch 
                          ? '✗ Mark as Incorrect' 
                          : '✓ Override - Mark as Correct'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center items-center">
        <button
          onClick={generatePDF}
          className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow-md flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Download PDF Report
        </button>
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
  overridden?: boolean;
  effectiveMatch?: boolean;
  onOverride?: () => void;
  showOverrideButton?: boolean;
}

function ResultItem({ label, match, expected, found, confidence, overridden, effectiveMatch, onOverride, showOverrideButton }: ResultItemProps) {
  const displayMatch = effectiveMatch !== undefined ? effectiveMatch : match;
  
  return (
    <div className={`flex items-start gap-3 p-4 border-2 rounded-lg ${overridden ? 'border-warning bg-orange-50' : 'border-gray-200'}`}>
      <div className="flex-shrink-0 mt-0.5">
        {displayMatch ? (
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
          <span className={`text-sm font-semibold ${displayMatch ? 'text-success' : 'text-error'}`}>
            {displayMatch ? 'Match' : 'Mismatch'}
          </span>
          {overridden && (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
              👤 Manually Overridden
            </span>
          )}
          {!overridden && confidence !== undefined && (
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
        
        {/* Override button */}
        {showOverrideButton && onOverride && (
          <div className="mt-3">
            <button
              onClick={onOverride}
              className={`text-xs px-3 py-1.5 rounded-md font-medium transition-colors ${
                overridden
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-warning text-white hover:bg-warning-dark'
              }`}
            >
              {overridden ? '↩ Remove Override' : displayMatch ? '✗ Mark as Incorrect' : '✓ Override - Mark as Correct'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

