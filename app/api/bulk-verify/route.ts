import { NextRequest, NextResponse } from 'next/server';
import pLimit from 'p-limit';
import { extractTextFromImage } from '@/lib/ocr';
import { verifyLabel } from '@/lib/verification';
import { LabelFormData } from '@/types';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 minutes for batch processing

// Concurrency limit to avoid overwhelming OpenAI API
const limit = pLimit(5); // Process 5 labels concurrently

/**
 * Retry with exponential backoff
 */
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isRateLimit = error instanceof Error && 
        (error.message.includes('rate limit') || error.message.includes('429'));
      
      if (attempt < maxRetries - 1 && isRateLimit) {
        const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded');
}

/**
 * Match forms to images intelligently by brand name
 */
function matchFormsToImages(
  forms: LabelFormData[],
  images: { name: string; base64: string }[]
): Array<{ form: LabelFormData; image: { name: string; base64: string }; matchedBy: string }> {
  const matches: Array<{ form: LabelFormData; image: { name: string; base64: string }; matchedBy: string }> = [];
  const usedImageIndices = new Set<number>();

  // Try to match each form to an image
  for (const form of forms) {
    const brandName = form.brandName.toLowerCase().trim();
    
    // Look for image with matching brand name in filename
    let matchedImageIndex = -1;
    let matchedBy = 'sequential order';

    for (let i = 0; i < images.length; i++) {
      if (usedImageIndices.has(i)) continue;
      
      const imageName = images[i].name.toLowerCase();
      
      // Check if brand name appears in image filename
      if (imageName.includes(brandName) || brandName.includes(imageName.replace(/\.(jpg|jpeg|png|gif|webp)$/i, ''))) {
        matchedImageIndex = i;
        matchedBy = `filename match: "${images[i].name}"`;
        break;
      }
    }

    // If no filename match, use sequential matching
    if (matchedImageIndex === -1) {
      for (let i = 0; i < images.length; i++) {
        if (!usedImageIndices.has(i)) {
          matchedImageIndex = i;
          matchedBy = 'sequential order';
          break;
        }
      }
    }

    if (matchedImageIndex !== -1) {
      matches.push({
        form,
        image: images[matchedImageIndex],
        matchedBy,
      });
      usedImageIndices.add(matchedImageIndex);
    }
  }

  return matches;
}

/**
 * POST /api/bulk-verify
 * Verifies multiple labels in batch
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { forms, images } = body as {
      forms: LabelFormData[];
      images: { name: string; base64: string }[];
    };

    // Validate inputs
    if (!forms || !Array.isArray(forms) || forms.length === 0) {
      return NextResponse.json(
        { error: 'No forms provided' },
        { status: 400 }
      );
    }

    if (!images || !Array.isArray(images) || images.length === 0) {
      return NextResponse.json(
        { error: 'No images provided' },
        { status: 400 }
      );
    }

    if (forms.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 forms allowed' },
        { status: 400 }
      );
    }

    if (images.length > 100) {
      return NextResponse.json(
        { error: 'Maximum 100 images allowed' },
        { status: 400 }
      );
    }

    // Match forms to images
    const matches = matchFormsToImages(forms, images);

    // Process each match with concurrency control and retry logic
    const verificationPromises = matches.map((match, i) =>
      limit(async () => {
        try {
          // Extract text with retry on rate limits
          const ocrResult = await retryWithBackoff(() =>
            extractTextFromImage(match.image.base64)
          );
          
          // Verify against form data
          const verificationResult = verifyLabel(match.form, ocrResult);
          
          return {
            status: 'fulfilled' as const,
            value: {
              formIndex: i,
              imageIndex: i,
              brandName: match.form.brandName,
              matchedBy: match.matchedBy,
              result: verificationResult,
            }
          };
        } catch (error) {
          // If individual verification fails, record the error
          return {
            status: 'fulfilled' as const,
            value: {
              formIndex: i,
              imageIndex: i,
              brandName: match.form.brandName,
              matchedBy: match.matchedBy,
              result: {
                success: false,
                overallMatch: false,
                details: {
                  brandName: { match: false, expected: match.form.brandName, found: null, confidence: 0 },
                  productType: { match: false, expected: match.form.productType, found: null, confidence: 0 },
                  alcoholContent: { match: false, expected: match.form.alcoholContent, found: null, confidence: 0 },
                  netContents: { match: false, expected: match.form.netContents, found: null, confidence: 0 },
                  governmentWarning: { present: false, confidence: 0 },
                },
                discrepancies: ['brandName', 'productType', 'alcoholContent', 'netContents', 'governmentWarning'],
                error: error instanceof Error ? error.message : 'Failed to process image',
              },
            }
          };
        }
      })
    );

    // Wait for all verifications to complete
    const settledResults = await Promise.all(verificationPromises);
    const results = settledResults.map(r => r.value);

    return NextResponse.json(
      { results },
      { status: 200 }
    );

  } catch (error) {
    console.error('Bulk Verification Error:', error);
    
    return NextResponse.json(
      {
        error: error instanceof Error 
          ? error.message 
          : 'Failed to process bulk verification'
      },
      { status: 500 }
    );
  }
}

