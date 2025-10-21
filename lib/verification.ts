import { LabelFormData, OCRResult, VerificationResult, FieldVerificationResult } from '@/types';

/**
 * Normalize text for comparison (lowercase, trim, remove extra spaces and special chars)
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .replace(/[^\w\s%.-]/g, ''); // Keep alphanumeric, spaces, %, ., -
}

/**
 * Extract numeric value from string (e.g., "45%" -> 45, "750 mL" -> 750)
 */
function extractNumber(text: string): number | null {
  const match = text.match(/(\d+\.?\d*)/);
  return match ? parseFloat(match[1]) : null;
}

/**
 * Extract unit from volume string (e.g., "750 mL" -> "ml")
 */
function extractUnit(text: string): string | null {
  const normalized = normalizeText(text);
  
  // Common unit patterns
  const unitPatterns = [
    { pattern: /\b(ml|milliliters?)\b/i, unit: 'ml' },
    { pattern: /\b(l|liters?)\b/i, unit: 'l' },
    { pattern: /\b(oz|fl\s*oz|fluid\s*ounces?)\b/i, unit: 'oz' },
    { pattern: /\b(gal|gallons?)\b/i, unit: 'gal' },
  ];

  for (const { pattern, unit } of unitPatterns) {
    if (pattern.test(normalized)) {
      return unit;
    }
  }

  return null;
}

/**
 * Verify brand name matches
 */
function verifyBrandName(
  expected: string,
  ocrResult: OCRResult
): FieldVerificationResult {
  const normalizedExpected = normalizeText(expected);
  const normalizedFullText = normalizeText(ocrResult.fullText);
  const normalizedOCRBrand = ocrResult.brandName ? normalizeText(ocrResult.brandName) : '';

  // Check if expected brand appears in OCR brand name or full text
  const matchInBrand = normalizedOCRBrand.includes(normalizedExpected);
  const matchInFullText = normalizedFullText.includes(normalizedExpected);
  const match = matchInBrand || matchInFullText;

  return {
    match,
    expected,
    found: ocrResult.brandName || (match ? 'Found in label text' : null),
  };
}

/**
 * Verify product type matches
 */
function verifyProductType(
  expected: string,
  ocrResult: OCRResult
): FieldVerificationResult {
  const normalizedExpected = normalizeText(expected);
  const normalizedFullText = normalizeText(ocrResult.fullText);
  const normalizedOCRType = ocrResult.productType ? normalizeText(ocrResult.productType) : '';

  // Check for exact match or if expected is contained in OCR result
  const exactMatch = normalizedExpected === normalizedOCRType;
  const partialMatch = normalizedOCRType.includes(normalizedExpected) || 
                      normalizedExpected.includes(normalizedOCRType);
  const matchInFullText = normalizedFullText.includes(normalizedExpected);
  
  const match = exactMatch || partialMatch || matchInFullText;

  return {
    match,
    expected,
    found: ocrResult.productType || (match ? 'Found in label text' : null),
  };
}

/**
 * Verify alcohol content matches
 */
function verifyAlcoholContent(
  expected: string,
  ocrResult: OCRResult
): FieldVerificationResult {
  // Extract number from expected value
  const expectedNumber = extractNumber(expected);
  if (expectedNumber === null) {
    return {
      match: false,
      expected,
      found: null,
    };
  }

  // Extract number from OCR result
  const ocrABV = ocrResult.alcoholContent;
  if (!ocrABV) {
    return {
      match: false,
      expected: `${expectedNumber}%`,
      found: null,
    };
  }

  const foundNumber = extractNumber(ocrABV);
  if (foundNumber === null) {
    return {
      match: false,
      expected: `${expectedNumber}%`,
      found: ocrABV,
    };
  }

  // Allow small tolerance for rounding (±0.1%)
  const tolerance = 0.1;
  const match = Math.abs(expectedNumber - foundNumber) <= tolerance;

  return {
    match,
    expected: `${expectedNumber}%`,
    found: `${foundNumber}%`,
  };
}

/**
 * Verify net contents/volume matches
 */
function verifyNetContents(
  expected: string,
  ocrResult: OCRResult
): FieldVerificationResult {
  const expectedNumber = extractNumber(expected);
  const expectedUnit = extractUnit(expected);

  if (expectedNumber === null || expectedUnit === null) {
    return {
      match: false,
      expected,
      found: null,
    };
  }

  const ocrVolume = ocrResult.netContents;
  if (!ocrVolume) {
    return {
      match: false,
      expected,
      found: null,
    };
  }

  const foundNumber = extractNumber(ocrVolume);
  const foundUnit = extractUnit(ocrVolume);

  if (foundNumber === null || foundUnit === null) {
    return {
      match: false,
      expected,
      found: ocrVolume,
    };
  }

  // Check if numbers match and units match
  const numbersMatch = Math.abs(expectedNumber - foundNumber) < 0.1;
  const unitsMatch = expectedUnit === foundUnit;
  const match = numbersMatch && unitsMatch;

  return {
    match,
    expected,
    found: ocrVolume,
  };
}

/**
 * Main verification function - compares form data with OCR results
 */
export function verifyLabel(
  formData: LabelFormData,
  ocrResult: OCRResult
): VerificationResult {
  // Verify each field
  const brandNameResult = verifyBrandName(formData.brandName, ocrResult);
  const productTypeResult = verifyProductType(formData.productType, ocrResult);
  const alcoholContentResult = verifyAlcoholContent(formData.alcoholContent, ocrResult);
  const netContentsResult = verifyNetContents(formData.netContents, ocrResult);

  // Government warning check
  const governmentWarningResult = {
    present: ocrResult.governmentWarning,
    text: ocrResult.governmentWarning ? 'Government warning detected' : undefined,
  };

  // Collect discrepancies
  const discrepancies: string[] = [];
  if (!brandNameResult.match) discrepancies.push('brandName');
  if (!productTypeResult.match) discrepancies.push('productType');
  if (!alcoholContentResult.match) discrepancies.push('alcoholContent');
  if (!netContentsResult.match) discrepancies.push('netContents');
  if (!governmentWarningResult.present) discrepancies.push('governmentWarning');

  // Overall match (all fields must pass)
  const overallMatch = discrepancies.length === 0;

  return {
    success: true,
    overallMatch,
    details: {
      brandName: brandNameResult,
      productType: productTypeResult,
      alcoholContent: alcoholContentResult,
      netContents: netContentsResult,
      governmentWarning: governmentWarningResult,
    },
    discrepancies,
    extractedText: ocrResult.fullText,
  };
}

