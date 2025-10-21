# Testing Guide

This document provides comprehensive testing instructions and test scenarios for the TTB Label Verification App.

## Table of Contents
1. [Testing Setup](#testing-setup)
2. [Manual Testing Scenarios](#manual-testing-scenarios)
3. [Creating Test Images](#creating-test-images)
4. [Expected Behaviors](#expected-behaviors)
5. [Edge Cases](#edge-cases)
6. [Performance Testing](#performance-testing)

---

## Testing Setup

### Prerequisites
- Application running locally at `http://localhost:3000`
- Valid OpenAI API key configured in `.env.local`
- Sample label images ready (see [Creating Test Images](#creating-test-images))

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Set up environment
cp env.template .env.local
# Edit .env.local with your OpenAI API key

# 3. Run development server
npm run dev

# 4. Open browser
open http://localhost:3000
```

---

## Manual Testing Scenarios

### Scenario 1: Perfect Match (Happy Path)

**Objective**: Verify that a label with all matching information passes verification.

**Test Data**:
- **Brand Name**: Old Tom Distillery
- **Product Type**: Kentucky Straight Bourbon Whiskey
- **Alcohol Content**: 45
- **Net Contents**: 750 mL

**Test Image**: Label containing all the above information clearly displayed, plus government warning text.

**Steps**:
1. Fill out form with the test data above
2. Upload the matching label image
3. Click "Verify Label"
4. Wait for processing (should take 3-10 seconds)

**Expected Result**:
```
✅ Label Verified Successfully!
All information on the label matches the form data.

Details:
✅ Brand Name: Match
✅ Product Type: Match  
✅ Alcohol Content: Match
✅ Net Contents: Match
✅ Government Warning: Present
```

**Pass Criteria**: All checks show ✅ green checkmarks.

---

### Scenario 2: Brand Name Mismatch

**Objective**: Verify that a different brand name is detected as a mismatch.

**Test Data**:
- **Brand Name**: Tom's Distillery (different from label)
- **Product Type**: Kentucky Straight Bourbon Whiskey
- **Alcohol Content**: 45
- **Alcohol Content**: 750 mL

**Test Image**: Label showing "Old Tom Distillery" (not "Tom's Distillery")

**Steps**:
1. Fill out form with "Tom's Distillery" as brand name
2. Upload label showing "Old Tom Distillery"
3. Click "Verify Label"

**Expected Result**:
```
❌ Label Verification Failed

❌ Brand Name: Not found or mismatch
   Expected: "Tom's Distillery"
   Found on label: "Old Tom Distillery"
✅ Product Type: Match
✅ Alcohol Content: Match
✅ Net Contents: Match
✅ Government Warning: Present
```

**Pass Criteria**: Brand Name check shows ❌ with clear explanation of discrepancy.

---

### Scenario 3: Alcohol Content Mismatch

**Objective**: Verify that incorrect ABV percentage is detected.

**Test Data**:
- **Brand Name**: Old Tom Distillery
- **Product Type**: Kentucky Straight Bourbon Whiskey
- **Alcohol Content**: 5 (incorrect)
- **Net Contents**: 750 mL

**Test Image**: Label showing "45% ABV"

**Expected Result**:
```
❌ Label Verification Failed

✅ Brand Name: Match
✅ Product Type: Match
❌ Alcohol Content: Not found or mismatch
   Expected: 5%
   Found on label: 45%
✅ Net Contents: Match
✅ Government Warning: Present
```

**Pass Criteria**: Alcohol Content check shows ❌ with expected vs actual values.

---

### Scenario 4: Missing Government Warning

**Objective**: Verify detection of missing mandatory government warning.

**Test Data**: Any valid form data

**Test Image**: Label with all information BUT no government warning text

**Expected Result**:
```
❌ Label Verification Failed

✅ Brand Name: Match
✅ Product Type: Match
✅ Alcohol Content: Match
✅ Net Contents: Match
❌ Government Warning: Missing or not detected
```

**Pass Criteria**: Government Warning check shows ❌.

---

### Scenario 5: Multiple Mismatches

**Objective**: Verify that all discrepancies are reported, not just the first one.

**Test Data**: 
- Brand Name: Wrong Brand
- Product Type: Vodka (label shows Bourbon)
- Alcohol Content: 40 (label shows 45)
- Net Contents: 1 L (label shows 750 mL)

**Expected Result**: All four checks should show ❌ with specific details for each mismatch.

**Pass Criteria**: Multiple failures are reported clearly.

---

### Scenario 6: Unreadable/Blurry Image

**Objective**: Verify graceful handling of poor quality images.

**Test Data**: Any valid form data

**Test Image**: Blurry, low-resolution, or corrupted image file

**Expected Result**:
```
⚠️ Error Processing Image

Could not read text from the label image. 
This might be due to:
- Image quality is too low
- Text is too small or blurry
- Image file is corrupted

Please try uploading a clearer, higher-resolution image.
```

**Pass Criteria**: Clear error message without crashing the app.

---

### Scenario 7: No Image Uploaded

**Objective**: Verify form validation prevents submission without image.

**Steps**:
1. Fill out all form fields
2. DO NOT upload an image
3. Try to click "Verify Label"

**Expected Result**: 
- Submit button is disabled OR
- Error message: "Please upload a label image"

**Pass Criteria**: User cannot submit without image.

---

### Scenario 8: Empty Form Fields

**Objective**: Verify form validation for required fields.

**Steps**:
1. Leave Brand Name field empty
2. Fill other fields
3. Upload image
4. Try to submit

**Expected Result**: 
- Field shows validation error "This field is required"
- Submit button is disabled OR submission is prevented

**Pass Criteria**: User cannot submit with empty required fields.

---

### Scenario 9: Case Insensitivity

**Objective**: Verify that matching is case-insensitive.

**Test Data**:
- **Brand Name**: old tom distillery (all lowercase)

**Test Image**: Label showing "OLD TOM DISTILLERY" (all uppercase)

**Expected Result**: ✅ Brand Name should match despite different case.

**Pass Criteria**: Case differences are ignored in matching.

---

### Scenario 10: Whitespace Tolerance

**Objective**: Verify that extra spaces don't break matching.

**Test Data**:
- **Brand Name**: Old  Tom   Distillery (extra spaces)

**Test Image**: Label showing "Old Tom Distillery"

**Expected Result**: ✅ Brand Name should match.

**Pass Criteria**: Extra whitespace is normalized and ignored.

---

### Scenario 11: ABV Format Variations

**Objective**: Verify that different ABV formats are recognized.

**Test Cases**:
| Form Input | Label Text | Should Match? |
|------------|------------|---------------|
| 45 | "45%" | ✅ Yes |
| 45% | "45% ABV" | ✅ Yes |
| 45 | "45% Alc./Vol." | ✅ Yes |
| 5.5 | "5.5% ABV" | ✅ Yes |
| 45 | "90 Proof" | ⚠️ No (bonus: could add proof conversion) |

**Pass Criteria**: Reasonable ABV format variations are matched.

---

### Scenario 12: Volume Format Variations

**Objective**: Verify that different volume formats are recognized.

**Test Cases**:
| Form Input | Label Text | Should Match? |
|------------|------------|---------------|
| 750 mL | "750mL" | ✅ Yes |
| 750 mL | "750 mL" | ✅ Yes |
| 12 oz | "12 FL OZ" | ✅ Yes |
| 12 oz | "12 fl oz" | ✅ Yes |
| 750 mL | "750 L" | ❌ No (different unit) |

**Pass Criteria**: Unit variations are handled, but different units don't match.

---

## Creating Test Images

### Option 1: AI Image Generation

Use tools like:
- **DALL-E 3** (OpenAI): "Create a bourbon whiskey label with brand name 'Old Tom Distillery', 45% ABV, 750 mL, Kentucky Straight Bourbon Whiskey, and government warning text"
- **Midjourney**: Similar prompt
- **Stable Diffusion**: For custom generation

**Pros**: Quick, realistic looking
**Cons**: May not have exact text you specify

### Option 2: Graphic Design Tools

Use tools like:
- **Canva**: Free templates for labels
- **Figma**: Design from scratch
- **Photoshop/GIMP**: Professional design

**Steps**:
1. Create or find label template
2. Add text fields:
   - Brand name (large, top)
   - Product type (middle)
   - ABV percentage (bottom or side)
   - Volume (bottom)
   - Government warning (very small, bottom)
3. Export as PNG or JPEG

**Pros**: Complete control over text
**Cons**: More time-consuming

### Option 3: Simple Text Overlay

Quick method using any image editor:
1. Find a bottle image online
2. Overlay text boxes with required information
3. Save as image

**Pros**: Very fast
**Cons**: Less realistic

### Option 4: Real Label Photos

Take photos of actual bottles, but note:
- Ensure text is clearly readable
- Good lighting
- No glare or reflections
- High resolution (at least 800x800px)

### Sample Label Template

Minimum label should include:

```
┌─────────────────────────────────┐
│                                 │
│      [BRAND NAME]               │
│      Large, bold text           │
│                                 │
│   [Product Type/Class]          │
│   Medium text                   │
│                                 │
│   [ABV%]     [Volume]           │
│   45% ABV    750 mL             │
│                                 │
│                                 │
│   GOVERNMENT WARNING: (1)       │
│   [warning text in small font]  │
│                                 │
└─────────────────────────────────┘
```

---

## Expected Behaviors

### Loading States
- Show spinner or "Processing..." message during OCR
- Disable form during processing
- Processing should take 3-15 seconds depending on image size

### Success State
- Green checkmarks for all passing checks
- Clear "Success" message at top
- Option to verify another label

### Failure State
- Red X marks for failed checks
- Specific details about what didn't match
- "Expected vs Found" comparison when possible
- Option to try again with different image or corrected form

### Error State
- Clear error message explaining the problem
- Suggestions for how to fix (e.g., "Try a clearer image")
- No technical jargon or stack traces shown to user

---

## Edge Cases

### Image Edge Cases
1. **Very large images (>10MB)**: Should be handled or rejected gracefully
2. **Wrong file type (PDF, video)**: Should show "Invalid file type" error
3. **Corrupted image file**: Should show error message
4. **Extremely small images (<100x100px)**: May fail OCR, show appropriate error
5. **Image with no text**: Should detect and report "No text found"

### Text Edge Cases
1. **Special characters in brand name**: Should handle Unicode, accents, etc.
2. **Very long brand name (>100 chars)**: Should not break UI
3. **Numbers in brand name**: "45 North Brewing" should work
4. **Decimal ABV**: "5.5%" should work
5. **Multiple volumes on label**: Should match primary volume

### API Edge Cases
1. **API key missing**: Show configuration error
2. **API key invalid**: Show authentication error
3. **Rate limit exceeded**: Show "Too many requests" message
4. **Network timeout**: Show retry option
5. **API service down**: Graceful degradation

---

## Performance Testing

### Load Testing
- **Image size**: Test with 1KB to 10MB images
- **Expected**: Larger images take longer but should complete
- **Max acceptable time**: 30 seconds for processing

### Concurrent Users
- Not critical for this MVP
- Note: OpenAI API has rate limits (check your tier)

### Browser Compatibility
Test on:
- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile Safari (iOS)
- ✅ Chrome Mobile (Android)

### Accessibility Testing
- ✅ Keyboard navigation works
- ✅ Screen reader compatibility
- ✅ Sufficient color contrast (WCAG AA)
- ✅ Form labels properly associated

---

## Automated Testing (Future)

### Unit Tests (if time permits)
```bash
# Example test structure
describe('Text Normalization', () => {
  it('should convert to lowercase', () => {
    expect(normalize('OLD TOM')).toBe('old tom');
  });
  
  it('should remove extra whitespace', () => {
    expect(normalize('Old  Tom')).toBe('old tom');
  });
});

describe('Matching Logic', () => {
  it('should match exact brand names', () => {
    expect(matchBrand('Old Tom', 'Old Tom Distillery')).toBe(true);
  });
  
  it('should not match different brands', () => {
    expect(matchBrand('Tom\'s', 'Old Tom')).toBe(false);
  });
});
```

### E2E Tests (if time permits)
Using Playwright or Cypress:
```javascript
test('successful label verification', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Fill form
  await page.fill('[name="brandName"]', 'Old Tom Distillery');
  await page.fill('[name="productType"]', 'Bourbon');
  await page.fill('[name="alcoholContent"]', '45');
  await page.fill('[name="netContents"]', '750 mL');
  
  // Upload image
  await page.setInputFiles('[type="file"]', 'test-images/perfect-match.jpg');
  
  // Submit
  await page.click('button[type="submit"]');
  
  // Verify results
  await expect(page.locator('text=Label Verified Successfully')).toBeVisible();
});
```

---

## Test Checklist

Before deploying or submitting, verify:

- [ ] All 12 manual test scenarios pass
- [ ] Form validation works for all required fields
- [ ] Image upload accepts JPEG and PNG
- [ ] OCR successfully extracts text from clear images
- [ ] Matching logic correctly identifies matches and mismatches
- [ ] Error messages are clear and helpful
- [ ] UI is responsive on mobile and desktop
- [ ] Loading states are shown during processing
- [ ] Success and failure states are visually distinct
- [ ] Application works in all major browsers
- [ ] No console errors in browser developer tools
- [ ] No server errors in terminal logs
- [ ] API key is not exposed in client-side code
- [ ] README instructions are accurate and complete
- [ ] Application deployed successfully to production

---

## Reporting Issues

If you find any bugs or unexpected behavior during testing:

1. **Document the issue**:
   - What did you do? (steps to reproduce)
   - What did you expect to happen?
   - What actually happened?
   - Screenshots or error messages

2. **Check the console**:
   - Browser DevTools Console (F12)
   - Server terminal logs

3. **Verify environment**:
   - Is API key configured correctly?
   - Is the dev server running?
   - Are there any network issues?

4. **Create an issue** in the repository with all the above information.

---

## Success Metrics

The application is considered fully functional if:
- ✅ 100% of happy path scenarios pass
- ✅ 90%+ of edge cases handled gracefully
- ✅ All error states show user-friendly messages
- ✅ Performance is acceptable (<30s for any request)
- ✅ No critical bugs or crashes

Happy testing! 🧪

