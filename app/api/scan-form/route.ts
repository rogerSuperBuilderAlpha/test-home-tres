import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromImage, validateImage } from '@/lib/ocr';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * POST /api/scan-form
 * Scans a TTB application form image and extracts field data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64 } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'Missing image data' },
        { status: 400 }
      );
    }

    // Validate image
    try {
      validateImage(imageBase64);
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Invalid image' },
        { status: 400 }
      );
    }

    // Extract text from form image using OCR
    const ocrResult = await extractTextFromImage(imageBase64);

    // Return the extracted form data
    return NextResponse.json(
      {
        result: {
          brandName: ocrResult.brandName || '',
          productType: ocrResult.productType || '',
          alcoholContent: ocrResult.alcoholContent || '',
          netContents: ocrResult.netContents || '',
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Form Scan Error:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error 
          ? error.message 
          : 'Failed to scan form. Please ensure the image is clear and contains the TTB form fields.'
      },
      { status: 500 }
    );
  }
}

