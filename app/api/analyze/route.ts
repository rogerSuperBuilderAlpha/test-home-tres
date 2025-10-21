import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromImage, validateImage } from '@/lib/ocr';

export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * POST /api/analyze
 * Analyzes an image and extracts label information without verification
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

    // Extract text from image
    const ocrResult = await extractTextFromImage(imageBase64);

    // Return just the extracted data (no verification)
    return NextResponse.json(
      {
        result: {
          brandName: ocrResult.brandName || '',
          productType: ocrResult.productType || '',
          alcoholContent: ocrResult.alcoholContent || '',
          netContents: ocrResult.netContents || '',
          fullText: ocrResult.fullText,
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Analysis Error:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error 
          ? error.message 
          : 'Failed to analyze image'
      },
      { status: 500 }
    );
  }
}

