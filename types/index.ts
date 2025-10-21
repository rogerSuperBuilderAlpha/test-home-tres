/**
 * Form data submitted by the user
 */
export interface LabelFormData {
  brandName: string;
  productType: string;
  alcoholContent: string; // Can be "45" or "45%"
  netContents: string; // e.g., "750 mL" or "12 fl oz"
}

/**
 * Individual field verification result
 */
export interface FieldVerificationResult {
  match: boolean;
  expected: string;
  found: string | null;
  confidence?: number; // Optional confidence score 0-100
}

/**
 * Government warning check result
 */
export interface GovernmentWarningResult {
  present: boolean;
  text?: string; // The actual warning text found (if any)
}

/**
 * Complete verification result returned from API
 */
export interface VerificationResult {
  success: boolean;
  overallMatch: boolean;
  details: {
    brandName: FieldVerificationResult;
    productType: FieldVerificationResult;
    alcoholContent: FieldVerificationResult;
    netContents: FieldVerificationResult;
    governmentWarning: GovernmentWarningResult;
  };
  discrepancies: string[]; // List of field names that failed
  extractedText?: string; // Raw OCR text (for debugging)
  error?: string; // Error message if processing failed
}

/**
 * OCR extraction result from OpenAI Vision API
 */
export interface OCRResult {
  brandName: string | null;
  productType: string | null;
  alcoholContent: string | null;
  netContents: string | null;
  governmentWarning: boolean;
  fullText: string; // Complete extracted text
  confidence?: number; // Overall confidence score
}

/**
 * API request payload
 */
export interface VerificationRequest {
  formData: LabelFormData;
  imageBase64: string; // Base64 encoded image
}

/**
 * API response payload
 */
export interface VerificationResponse {
  result?: VerificationResult;
  error?: string;
}

