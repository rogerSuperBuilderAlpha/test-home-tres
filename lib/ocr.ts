import OpenAI from 'openai';
import { OCRResult } from '@/types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

/**
 * Extract text and structured information from a label image using OpenAI Vision API
 * @param imageBase64 - Base64 encoded image string
 * @returns Structured OCR result with extracted fields
 */
export async function extractTextFromImage(imageBase64: string): Promise<OCRResult> {
  try {
    // Validate API key
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    // Prepare the image data URL
    const imageDataUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    // Call OpenAI Vision API with structured extraction prompt
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `You are analyzing an alcohol beverage label. Extract the following information and return it as JSON:

1. brandName: The brand name/distillery name (e.g., "Old Tom Distillery")
2. productType: The product class/type (e.g., "Kentucky Straight Bourbon Whiskey", "IPA", "Cabernet Sauvignon")
3. alcoholContent: The alcohol percentage/ABV (e.g., "45%", "5.5% ABV", "40% Alc./Vol.")
4. netContents: The volume/net contents (e.g., "750 mL", "12 fl oz", "1 L")
5. governmentWarning: Boolean - Does the label contain a "GOVERNMENT WARNING" statement?
6. fullText: All text visible on the label (verbatim)

Return ONLY valid JSON in this exact format:
{
  "brandName": "string or null",
  "productType": "string or null",
  "alcoholContent": "string or null",
  "netContents": "string or null",
  "governmentWarning": boolean,
  "fullText": "string"
}

If any field is not found or unclear, use null for that field. Be precise and extract exact text as it appears.`,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
      temperature: 0.1, // Low temperature for more deterministic results
    });

    // Extract the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from OpenAI Vision API');
    }

    // Parse JSON response
    let parsedResult: OCRResult;
    try {
      // Remove markdown code blocks if present
      const cleanedContent = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsedResult = JSON.parse(cleanedContent);
    } catch {
      console.error('Failed to parse OpenAI response:', content);
      throw new Error('Failed to parse OCR result. Image may be unreadable.');
    }

    // Validate that we got some text
    if (!parsedResult.fullText || parsedResult.fullText.trim().length < 10) {
      throw new Error('Could not extract sufficient text from the image. Please ensure the image is clear and contains readable text.');
    }

    return parsedResult;
  } catch (error) {
    // Handle different error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        throw new Error('Service configuration error. Please contact support.');
      }
      if (error.message.includes('rate limit')) {
        throw new Error('Service temporarily busy. Please try again in a moment.');
      }
      // Re-throw with original message for other errors
      throw error;
    }
    throw new Error('Failed to process image. Please try again.');
  }
}

/**
 * Validate image data before sending to OCR
 * @param imageBase64 - Base64 encoded image string
 * @returns true if valid, throws error otherwise
 */
export function validateImage(imageBase64: string): boolean {
  // Check if base64 string is present
  if (!imageBase64 || imageBase64.trim().length === 0) {
    throw new Error('No image data provided');
  }

  // Check if it's a valid base64 image
  const base64Pattern = /^data:image\/(jpeg|jpg|png|gif|webp);base64,/;
  if (!base64Pattern.test(imageBase64)) {
    throw new Error('Invalid image format. Please upload a JPEG, PNG, GIF, or WebP image.');
  }

  // Estimate file size (base64 is ~1.37x original size)
  const base64Length = imageBase64.split(',')[1]?.length || 0;
  const fileSizeBytes = (base64Length * 3) / 4;
  const fileSizeMB = fileSizeBytes / (1024 * 1024);

  if (fileSizeMB > 10) {
    throw new Error('Image file is too large (max 10MB). Please upload a smaller image.');
  }

  return true;
}

