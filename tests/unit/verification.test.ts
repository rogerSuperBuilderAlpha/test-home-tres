import { verifyLabel } from '@/lib/verification';
import { LabelFormData, OCRResult } from '@/types';

function makeOCR(overrides: Partial<OCRResult>): OCRResult {
  return {
    brandName: 'Old Tom Distillery',
    productType: 'Kentucky Straight Bourbon Whiskey',
    alcoholContent: '45% Alc./Vol. (90 Proof)',
    netContents: '750 mL',
    governmentWarning: true,
    fullText: `OLD TOM DISTILLERY\nKentucky Straight Bourbon Whiskey\n45% Alc./Vol. (90 Proof)\n750 mL\nGOVERNMENT WARNING: (1) According to the Surgeon General, women should not drink alcoholic beverages during pregnancy because of the risk of birth defects. (2) Consumption of alcoholic beverages impairs your ability to drive a car or operate machinery, and may cause health problems.`,
    ...overrides,
  };
}

describe('verifyLabel', () => {
  test('passes when all fields match exactly', () => {
    const form: LabelFormData = {
      brandName: 'Old Tom Distillery',
      productType: 'Kentucky Straight Bourbon Whiskey',
      alcoholContent: '45',
      netContents: '750 mL',
    };

    const ocr = makeOCR({});
    const result = verifyLabel(form, ocr);

    expect(result.overallMatch).toBe(true);
    expect(result.discrepancies).toHaveLength(0);
  });

  test('detects brand mismatch', () => {
    const form: LabelFormData = {
      brandName: "Tom's Distillery",
      productType: 'Kentucky Straight Bourbon Whiskey',
      alcoholContent: '45',
      netContents: '750 mL',
    };

    const ocr = makeOCR({});
    const result = verifyLabel(form, ocr);

    expect(result.overallMatch).toBe(false);
    expect(result.details.brandName.match).toBe(false);
    expect(result.discrepancies).toContain('brandName');
  });

  test('accepts ABV within tolerance', () => {
    const form: LabelFormData = {
      brandName: 'Old Tom Distillery',
      productType: 'Kentucky Straight Bourbon Whiskey',
      alcoholContent: '45.05',
      netContents: '750 mL',
    };

    const ocr = makeOCR({});
    const result = verifyLabel(form, ocr);
    expect(result.details.alcoholContent.match).toBe(true);
  });

  test('flags ABV mismatch beyond tolerance', () => {
    const form: LabelFormData = {
      brandName: 'Old Tom Distillery',
      productType: 'Kentucky Straight Bourbon Whiskey',
      alcoholContent: '44.7',
      netContents: '750 mL',
    };

    const ocr = makeOCR({});
    const result = verifyLabel(form, ocr);
    expect(result.details.alcoholContent.match).toBe(false);
  });

  test('matches net contents number and unit', () => {
    const form: LabelFormData = {
      brandName: 'Old Tom Distillery',
      productType: 'Kentucky Straight Bourbon Whiskey',
      alcoholContent: '45',
      netContents: '750 mL',
    };

    const ocr = makeOCR({ netContents: '750 ml' });
    const result = verifyLabel(form, ocr);
    expect(result.details.netContents.match).toBe(true);
  });

  test('government warning presence and exact text', () => {
    const form: LabelFormData = {
      brandName: 'Old Tom Distillery',
      productType: 'Kentucky Straight Bourbon Whiskey',
      alcoholContent: '45',
      netContents: '750 mL',
    };

    const ocr = makeOCR({});
    const result = verifyLabel(form, ocr);
    expect(result.details.governmentWarning.present).toBe(true);
    expect(result.details.governmentWarning.confidence).toBeGreaterThan(0);
  });

  test('handles missing fields gracefully', () => {
    const form: LabelFormData = {
      brandName: 'Old Tom Distillery',
      productType: 'Kentucky Straight Bourbon Whiskey',
      alcoholContent: '45',
      netContents: '750 mL',
    };

    const ocr = makeOCR({ productType: null, alcoholContent: null, netContents: null, fullText: 'OLD TOM DISTILLERY' });
    const result = verifyLabel(form, ocr);
    expect(result.overallMatch).toBe(false);
    expect(result.discrepancies).toEqual(
      expect.arrayContaining(['productType', 'alcoholContent', 'netContents', 'governmentWarning'])
    );
  });
});


