import { LabelFormData, OCRResult, VerificationResult, FieldVerificationResult } from '@/types';

// Official TTB Government Warning Text (27 CFR 16.21)
const OFFICIAL_WARNING_TEXT = `GOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.`;

// Key phrases that must be present
const REQUIRED_WARNING_PHRASES = [
  'GOVERNMENT WARNING',
  'Surgeon General',
  'pregnant',
  'birth defects',
  'drive',
  'health problems'
];

/**
 * Calculate Levenshtein distance between two strings (for fuzzy matching)
 */
function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;
  const dp: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,    // deletion
          dp[i][j - 1] + 1,    // insertion
          dp[i - 1][j - 1] + 1 // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Calculate similarity percentage between two strings
 */
function calculateSimilarity(str1: string, str2: string): number {
  const distance = levenshteinDistance(str1, str2);
  const maxLength = Math.max(str1.length, str2.length);
  return maxLength === 0 ? 100 : ((1 - distance / maxLength) * 100);
}

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
 * Verify brand name matches with fuzzy matching
 */
function verifyBrandName(
  expected: string,
  ocrResult: OCRResult
): FieldVerificationResult {
  const normalizedExpected = normalizeText(expected);
  const normalizedFullText = normalizeText(ocrResult.fullText);
  const normalizedOCRBrand = ocrResult.brandName ? normalizeText(ocrResult.brandName) : '';

  // Check exact substring match first
  const exactMatchInBrand = normalizedOCRBrand.includes(normalizedExpected);
  const exactMatchInFullText = normalizedFullText.includes(normalizedExpected);
  
  // Calculate fuzzy match confidence
  let confidence = 0;
  if (exactMatchInBrand || exactMatchInFullText) {
    confidence = 100; // Exact match
  } else if (normalizedOCRBrand) {
    // Try fuzzy matching with Levenshtein distance
    confidence = calculateSimilarity(normalizedExpected, normalizedOCRBrand);
  }

  // Match if confidence is above 70%
  const match = confidence >= 70;

  return {
    match,
    expected,
    found: ocrResult.brandName || (match ? 'Found in label text' : null),
    confidence: Math.round(confidence),
  };
}

/**
 * Verify product type matches with fuzzy matching
 */
function verifyProductType(
  expected: string,
  ocrResult: OCRResult
): FieldVerificationResult {
  const normalizedExpected = normalizeText(expected);
  const normalizedFullText = normalizeText(ocrResult.fullText);
  const normalizedOCRType = ocrResult.productType ? normalizeText(ocrResult.productType) : '';

  // Check for exact match
  const exactMatch = normalizedExpected === normalizedOCRType;
  const partialMatch = normalizedOCRType.includes(normalizedExpected) || 
                      normalizedExpected.includes(normalizedOCRType);
  const matchInFullText = normalizedFullText.includes(normalizedExpected);
  
  // Calculate confidence
  let confidence = 0;
  if (exactMatch) {
    confidence = 100;
  } else if (partialMatch || matchInFullText) {
    confidence = 90; // Good partial match
  } else if (normalizedOCRType) {
    // Fuzzy match
    confidence = calculateSimilarity(normalizedExpected, normalizedOCRType);
  }

  const match = confidence >= 70;

  return {
    match,
    expected,
    found: ocrResult.productType || (match ? 'Found in label text' : null),
    confidence: Math.round(confidence),
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
      confidence: 0,
    };
  }

  // Extract number from OCR result
  const ocrABV = ocrResult.alcoholContent;
  if (!ocrABV) {
    return {
      match: false,
      expected: `${expectedNumber}%`,
      found: null,
      confidence: 0,
    };
  }

  const foundNumber = extractNumber(ocrABV);
  if (foundNumber === null) {
    return {
      match: false,
      expected: `${expectedNumber}%`,
      found: ocrABV,
      confidence: 0,
    };
  }

  // Calculate confidence based on difference
  const difference = Math.abs(expectedNumber - foundNumber);
  const tolerance = 0.1;
  const match = difference <= tolerance;
  
  // Confidence decreases with difference
  let confidence = 100;
  if (difference > 0) {
    confidence = Math.max(0, 100 - (difference * 20)); // Lose 20% per 1% difference
  }

  return {
    match,
    expected: `${expectedNumber}%`,
    found: `${foundNumber}%`,
    confidence: Math.round(confidence),
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
      confidence: 0,
    };
  }

  const ocrVolume = ocrResult.netContents;
  if (!ocrVolume) {
    return {
      match: false,
      expected,
      found: null,
      confidence: 0,
    };
  }

  const foundNumber = extractNumber(ocrVolume);
  const foundUnit = extractUnit(ocrVolume);

  if (foundNumber === null || foundUnit === null) {
    return {
      match: false,
      expected,
      found: ocrVolume,
      confidence: 0,
    };
  }

  // Check if numbers match and units match
  const numberDifference = Math.abs(expectedNumber - foundNumber);
  const numbersMatch = numberDifference < 0.1;
  const unitsMatch = expectedUnit === foundUnit;
  const match = numbersMatch && unitsMatch;

  // Calculate confidence
  let confidence = 0;
  if (unitsMatch) {
    confidence = 50; // Base for matching units
    if (numbersMatch) {
      confidence = 100; // Perfect match
    } else {
      // Deduct based on difference
      const percentDiff = (numberDifference / expectedNumber) * 100;
      confidence = Math.max(0, 100 - percentDiff * 2);
    }
  }

  return {
    match,
    expected,
    found: ocrVolume,
    confidence: Math.round(confidence),
  };
}

/**
 * Verify government warning statement (detailed check)
 */
function verifyGovernmentWarning(ocrResult: OCRResult): {
  present: boolean;
  text?: string;
  confidence?: number;
  missingPhrases?: string[];
  exact?: boolean;
} {
  const fullText = ocrResult.fullText.toLowerCase();
  
  // Check for presence of key phrases
  const foundPhrases: string[] = [];
  const missingPhrases: string[] = [];
  
  for (const phrase of REQUIRED_WARNING_PHRASES) {
    if (fullText.includes(phrase.toLowerCase())) {
      foundPhrases.push(phrase);
    } else {
      missingPhrases.push(phrase);
    }
  }

  const present = foundPhrases.includes('GOVERNMENT WARNING');
  
  // Calculate confidence based on how many required phrases are present
  const confidence = (foundPhrases.length / REQUIRED_WARNING_PHRASES.length) * 100;
  
  // Check if it's an exact match
  const normalizedWarning = normalizeText(OFFICIAL_WARNING_TEXT);
  const normalizedFullText = normalizeText(ocrResult.fullText);
  const exact = normalizedFullText.includes(normalizedWarning);

  let statusText = '';
  if (exact) {
    statusText = 'Exact TTB-compliant warning text detected';
  } else if (present && missingPhrases.length === 0) {
    statusText = 'All required warning phrases present';
  } else if (present) {
    statusText = 'Government warning present but incomplete';
  } else {
    statusText = 'Government warning missing';
  }

  return {
    present,
    text: statusText,
    confidence: Math.round(confidence),
    missingPhrases: missingPhrases.length > 0 ? missingPhrases : undefined,
    exact,
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

  // Detailed government warning check
  const governmentWarningResult = verifyGovernmentWarning(ocrResult);

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

