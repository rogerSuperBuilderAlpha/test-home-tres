import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromImage, validateImage } from '@/lib/ocr';
import { verifyLabel } from '@/lib/verification';
import { VerificationRequest, VerificationResponse } from '@/types';

// Increase body size limit for image uploads
export const runtime = 'nodejs';
export const maxDuration = 30; // 30 seconds timeout

/**
 * POST /api/verify
 * Verifies an alcohol label image against form data
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: VerificationRequest = await request.json();
    const { formData, imageBase64 } = body;

    // Validate inputs
    if (!formData || !imageBase64) {
      return NextResponse.json(
        { error: 'Missing required fields: formData and imageBase64' } as VerificationResponse,
        { status: 400 }
      );
    }

    // Validate all form fields are present
    const requiredFields: (keyof typeof formData)[] = [
      'brandName',
      'productType',
      'alcoholContent',
      'netContents',
    ];
    
    for (const field of requiredFields) {
      if (!formData[field] || formData[field].trim() === '') {
        return NextResponse.json(
          { error: `Missing required field: ${field}` } as VerificationResponse,
          { status: 400 }
        );
      }
    }

    // Validate image
    try {
      validateImage(imageBase64);
    } catch (error) {
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : 'Invalid image'
        } as VerificationResponse,
        { status: 400 }
      );
    }

    // Extract text from image using OCR
    let ocrResult;
    try {
      ocrResult = await extractTextFromImage(imageBase64);
    } catch (error) {
      // Handle OCR-specific errors
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to process image';
      
      return NextResponse.json(
        { error: errorMessage } as VerificationResponse,
        { status: 500 }
      );
    }

    // Verify label against form data
    const verificationResult = verifyLabel(formData, ocrResult);

    // Return successful verification result
    return NextResponse.json(
      { result: verificationResult } as VerificationResponse,
      { status: 200 }
    );

  } catch (error) {
    console.error('API Error:', error);
    
    // Handle unexpected errors
    return NextResponse.json(
      { 
        error: 'An unexpected error occurred. Please try again.' 
      } as VerificationResponse,
      { status: 500 }
    );
  }
}

/**
 * GET /api/verify
 * Health check endpoint
 */
export async function GET() {
  return NextResponse.json(
    { 
      status: 'ok', 
      message: 'TTB Label Verification API',
      version: '1.0.0'
    },
    { status: 200 }
  );
}

