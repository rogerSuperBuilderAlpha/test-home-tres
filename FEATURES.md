# Feature Breakdown & Roadmap

This document organizes all features into three categories: **Core Requirements** (must-have), **Suggested Extras** (bonus objectives from requirements), and **Creative Additions** (innovative enhancements beyond the spec).

---

## 🎯 Core Requirements (Must Have)

These are the mandatory features required to meet the project specifications.

### Phase 1: Form & UI (Priority: Critical)

#### 1.1 Input Form
- [ ] **Brand Name** field (text input, required)
- [ ] **Product Class/Type** field (text input, required)
  - Examples: "Kentucky Straight Bourbon Whiskey", "IPA", "Cabernet Sauvignon"
- [ ] **Alcohol Content (ABV)** field (number input, required)
  - Accept both "45" and "45%" formats
  - Validation: 0-100 range
- [ ] **Net Contents** field (text input, required)
  - Examples: "750 mL", "12 fl oz"
  - Parse number and unit separately
- [ ] Form validation
  - All required fields must be filled
  - Real-time validation feedback
  - Clear error messages for invalid inputs
- [ ] Clear/Reset button

**Acceptance Criteria:**
- Form prevents submission with empty required fields
- User sees inline validation errors
- Form is mobile-responsive

---

#### 1.2 Image Upload
- [ ] File upload input (`<input type="file">`)
- [ ] Support for common formats: JPEG, PNG, GIF, WebP
- [ ] File size limit (10MB max)
- [ ] Image preview after upload
- [ ] Drag-and-drop upload area (bonus: enhances UX)
- [ ] Clear/replace uploaded image
- [ ] Upload progress indicator

**Acceptance Criteria:**
- User can upload image via button click or drag-drop
- Image preview displays before submission
- Invalid file types show clear error message
- Large files are rejected with helpful message

---

#### 1.3 Basic UI/UX
- [ ] Clean, simple layout
- [ ] Logical grouping of form fields
- [ ] Proper labels for all inputs
- [ ] Responsive design (mobile and desktop)
- [ ] Submit button (disabled until form is valid)
- [ ] Loading state during processing
- [ ] Professional color scheme and typography

**Acceptance Criteria:**
- UI is intuitive without instructions
- Works on mobile devices (tested on iOS/Android)
- No broken layouts or overlapping text

---

### Phase 2: Backend & OCR (Priority: Critical)

#### 2.1 Image Processing API
- [ ] API endpoint: `POST /api/verify`
- [ ] Accept multipart form data (image + form fields)
- [ ] Image validation (type, size, format)
- [ ] OCR integration (OpenAI Vision API)
- [ ] Error handling for API failures
- [ ] Timeout handling (30 second max)

**Acceptance Criteria:**
- API successfully receives and processes images
- Returns structured JSON response
- Handles errors gracefully without crashing

---

#### 2.2 OCR/Text Extraction
- [ ] Extract all text from label image
- [ ] Use OpenAI Vision API (GPT-4o model)
- [ ] Return structured data (not just raw text)
- [ ] Handle low-quality images with error message
- [ ] Handle images with no readable text
- [ ] Base64 encode images for API submission

**Acceptance Criteria:**
- Successfully extracts text from clear images
- Returns helpful error for unreadable images
- Processing completes within 30 seconds

---

### Phase 3: Verification Logic (Priority: Critical)

#### 3.1 Text Matching Algorithm
- [ ] **Brand Name matching**
  - Case-insensitive comparison
  - Substring match (brand may appear in longer text)
  - Whitespace normalization
- [ ] **Product Type matching**
  - Case-insensitive comparison
  - Fuzzy matching (partial matches allowed)
  - Handle abbreviations (e.g., "Bourbon" in "Kentucky Straight Bourbon Whiskey")
- [ ] **Alcohol Content matching**
  - Extract number from form input
  - Search label for matching percentage
  - Allow format variations ("45%", "45% ABV", "45% Alc./Vol.")
  - Tolerance: ±0.1% for rounding
- [ ] **Net Contents matching**
  - Extract number and unit separately
  - Normalize units (mL vs ml vs milliliters)
  - Handle spacing variations ("750mL" vs "750 mL")
- [ ] **Government Warning check**
  - Search for "GOVERNMENT WARNING" phrase (minimum)
  - Case-insensitive search
  - Report presence/absence

**Acceptance Criteria:**
- All matching logic is deterministic and testable
- Handles common text variations
- Clearly documented matching rules

---

#### 3.2 Comparison & Results Generation
- [ ] Compare each field individually
- [ ] Track match/mismatch for each field
- [ ] Collect all discrepancies (don't stop at first error)
- [ ] Generate structured result object:
  ```json
  {
    "overallMatch": true/false,
    "details": {
      "brandName": { "match": true, "expected": "...", "found": "..." },
      "productType": { "match": true, "expected": "...", "found": "..." },
      "alcoholContent": { "match": false, "expected": "45%", "found": "40%" },
      "netContents": { "match": true, "expected": "750 mL", "found": "750mL" },
      "governmentWarning": { "present": true }
    },
    "discrepancies": ["alcoholContent"]
  }
  ```
- [ ] Include confidence scores (optional, nice to have)

**Acceptance Criteria:**
- All fields are checked, not just first failure
- Results clearly identify what matched and what didn't
- Results include specific details (expected vs found)

---

### Phase 4: Results Display (Priority: Critical)

#### 4.1 Success State
- [ ] Green success message banner
- [ ] "✅ Label Verified Successfully!" heading
- [ ] Field-by-field breakdown with checkmarks
- [ ] Summary: "All required information is consistent"
- [ ] "Verify Another Label" button

**Acceptance Criteria:**
- Success state is visually distinct and celebratory
- User clearly understands verification passed

---

#### 4.2 Failure State
- [ ] Red/orange failure message banner
- [ ] "❌ Label Verification Failed" heading
- [ ] Field-by-field breakdown showing:
  - ✅ Matched fields (green)
  - ❌ Mismatched fields (red) with details
  - Expected vs Found comparison for mismatches
- [ ] List of all discrepancies
- [ ] "Try Again" or "Edit Form" button

**Acceptance Criteria:**
- Failure state clearly explains what went wrong
- User can identify specific fields to fix
- All discrepancies are reported, not just first

---

#### 4.3 Error State
- [ ] Error message for unreadable images
  - "⚠️ Could not read text from the label image"
  - Suggestions: "Try a clearer, higher-resolution image"
- [ ] Error message for API failures
  - "Service temporarily unavailable"
  - "Try again" button
- [ ] Error message for invalid uploads
  - "Please upload a valid image file (JPEG, PNG)"
  - "Image file is too large (max 10MB)"
- [ ] Error message for configuration issues
  - "Service configuration error" (if API key missing)

**Acceptance Criteria:**
- All error states have user-friendly messages
- No technical jargon or stack traces shown
- Users understand how to fix the problem

---

### Phase 5: Deployment & Documentation (Priority: Critical)

#### 5.1 Deployment
- [ ] Deploy to Vercel (or similar platform)
- [ ] Configure environment variables securely
- [ ] Verify deployment works end-to-end
- [ ] Provide public URL

**Acceptance Criteria:**
- App is accessible via public URL
- All functionality works in production
- Environment variables are secure (not exposed)

---

#### 5.2 Documentation
- [x] **README.md** with:
  - [x] Project overview
  - [x] Setup instructions
  - [x] Environment variable configuration
  - [x] Local development guide
  - [x] Deployment instructions
  - [x] Testing instructions
- [x] **Technical approach documentation**:
  - [x] Why OpenAI Vision API?
  - [x] Matching algorithm explanation
  - [x] Assumptions and limitations
  - [x] Trade-offs made
- [x] **Testing guide**
- [x] **Deployment guide**
- [ ] Sample test images (at least 3-5)
- [ ] Screenshots/demo video (optional but recommended)

**Acceptance Criteria:**
- README is clear and complete
- Someone can clone, setup, and run locally without asking questions
- Technical decisions are explained

---

## 🌟 Suggested Extras (Bonus Objectives)

These features are mentioned in the requirements as optional enhancements. Implement after core is complete.

### Bonus 1: Detailed Compliance Checks (Medium Priority)

#### Government Warning Verification
- [ ] Store exact expected warning text:
  ```
  GOVERNMENT WARNING: (1) According to the Surgeon General, 
  women should not drink alcoholic beverages during pregnancy 
  because of the risk of birth defects. (2) Consumption of 
  alcoholic beverages impairs your ability to drive a car or 
  operate machinery, and may cause health problems.
  ```
- [ ] Compare OCR result against expected text
- [ ] Allow minor variations (punctuation, line breaks)
- [ ] Flag missing or incorrect wording
- [ ] Verify capitalization of key phrases ("GOVERNMENT WARNING", "Surgeon General")
- [ ] Report character-by-character differences

**Estimated Effort:** 2-3 hours

---

#### Wine-Specific Compliance
- [ ] Verify "Table Wine" designation if no ABV given
- [ ] Check for sulfite declaration ("Contains Sulfites")
- [ ] Validate appellation/geographic designation

**Estimated Effort:** 2-4 hours

---

### Bonus 2: Multiple Product Types (Medium Priority)

- [ ] Product type selector dropdown:
  - Distilled Spirits
  - Wine
  - Beer
  - Malt Beverages
- [ ] Dynamically adjust form fields based on selection:
  - **Beer**: Add "Style" (IPA, Stout, etc.), optional ingredients list
  - **Wine**: Add "Varietal" (Cabernet, Chardonnay), "Appellation", sulfite declaration
  - **Spirits**: Add "Proof" (optional, for conversion), "Age Statement"
- [ ] Different validation rules per type
- [ ] Type-specific compliance checks

**Estimated Effort:** 4-6 hours

---

### Bonus 3: Image Highlighting (High Wow Factor)

- [ ] Capture OCR coordinates from API (if available)
- [ ] Overlay colored rectangles on image:
  - Green boxes around matched text
  - Red boxes around mismatched text
  - Yellow boxes around missing expected text
- [ ] Interactive: hover over result item to highlight on image
- [ ] Use HTML Canvas or SVG for overlays
- [ ] Show side-by-side: original image vs annotated image

**Estimated Effort:** 4-6 hours

**Technical Approach:** 
- OpenAI Vision API doesn't return coordinates by default
- May need to use Google Cloud Vision or AWS Textract for bounding boxes
- Alternative: Use a second OCR pass with Tesseract (returns coordinates)

---

### Bonus 4: Refinement of OCR Results (Medium Priority)

#### Fuzzy Matching
- [ ] Implement Levenshtein distance algorithm
- [ ] Allow matches within edit distance of 2-3 characters
- [ ] Handle common OCR errors:
  - "O" vs "0" (letter O vs zero)
  - "l" vs "1" (lowercase L vs one)
  - "S" vs "5"
  - Missing/extra spaces
- [ ] Use fuzzy matching library (e.g., `fuse.js`)
- [ ] Display confidence score for fuzzy matches

**Estimated Effort:** 3-4 hours

---

#### Smart Text Normalization
- [ ] Remove punctuation intelligently
- [ ] Expand abbreviations ("ABV" = "Alcohol By Volume")
- [ ] Handle possessives ("Tom's" vs "Toms")
- [ ] Unicode normalization (accents, special characters)
- [ ] Number word conversion ("forty-five" = "45")

**Estimated Effort:** 2-3 hours

---

### Bonus 5: Polish and UX Improvements (High Priority)

#### Single-Page Application
- [ ] Async form submission (no page reload)
- [ ] Smooth animations/transitions
- [ ] Progressive disclosure (show results below form)
- [ ] Scroll to results automatically

**Estimated Effort:** 1-2 hours

---

#### Loading Indicators
- [ ] Spinner during OCR processing
- [ ] Progress bar with steps:
  1. Uploading image...
  2. Analyzing label...
  3. Verifying information...
  4. Complete!
- [ ] Estimated time remaining
- [ ] Disable form during processing

**Estimated Effort:** 1-2 hours

---

#### Professional Styling
- [ ] Use Tailwind CSS with custom theme
- [ ] Consistent color palette
- [ ] Icon library (Heroicons or Font Awesome)
- [ ] Subtle shadows and depth
- [ ] Smooth hover effects
- [ ] Responsive grid layout
- [ ] Typography hierarchy
- [ ] Print-friendly results page

**Estimated Effort:** 2-3 hours

---

### Bonus 6: Automated Tests (Medium Priority)

#### Unit Tests
- [ ] Test text normalization functions
- [ ] Test matching algorithms
- [ ] Test number/unit extraction
- [ ] Use Jest or Vitest
- [ ] Aim for >80% coverage on business logic

**Estimated Effort:** 3-4 hours

---

#### E2E Tests
- [ ] Use Playwright or Cypress
- [ ] Test happy path (perfect match)
- [ ] Test mismatch scenarios
- [ ] Test error handling
- [ ] Test form validation
- [ ] Run in CI/CD pipeline

**Estimated Effort:** 4-6 hours

---

## 🚀 Creative Additions (Beyond Requirements)

These are innovative features not mentioned in the spec that could make the app stand out.

### Creative Feature 1: Batch Processing (High Value)

**Description:** Upload multiple labels at once and verify them all in parallel.

#### Implementation:
- [ ] Multi-file upload component
- [ ] Queue system for processing multiple images
- [ ] Progress tracking for batch
- [ ] Summary view: X of Y passed
- [ ] Downloadable report with all results
- [ ] Filter view: Show only failures

**Use Case:** Producer has 10 product labels to verify before TTB submission.

**Estimated Effort:** 6-8 hours

**Technical Considerations:**
- Rate limiting (OpenAI API limits)
- Parallel processing vs sequential
- Memory usage with many images

---

### Creative Feature 2: Export/Download Verification Report (Medium Value)

**Description:** Generate a professional PDF report of verification results.

#### Implementation:
- [ ] PDF generation library (e.g., `jsPDF`, `pdfkit`)
- [ ] Report includes:
  - Company branding
  - Timestamp
  - Product information
  - Verification results (pass/fail)
  - Field-by-field details
  - Image thumbnail
  - Signature/approval section
- [ ] Download button
- [ ] Email report option (bonus)

**Use Case:** Producer needs documentation for record-keeping or TTB submission.

**Estimated Effort:** 4-5 hours

---

### Creative Feature 3: Verification History Dashboard (High Value)

**Description:** Track and review past verifications.

#### Implementation:
- [ ] Add database (PostgreSQL on Vercel or Supabase)
- [ ] Store verification records:
  - Date/time
  - Product info
  - Result (pass/fail)
  - Image (optional, or just thumbnail)
- [ ] Dashboard view:
  - Recent verifications table
  - Search/filter
  - Statistics (pass rate, common issues)
  - Charts/graphs (verification trends)
- [ ] User accounts (optional, use Clerk or NextAuth)
- [ ] Re-verify button for past submissions

**Use Case:** Producer wants to see history of all label verifications over time.

**Estimated Effort:** 8-12 hours

---

### Creative Feature 4: Confidence Scores (Medium Value)

**Description:** Show confidence level for each verification check.

#### Implementation:
- [ ] OCR confidence scores (from API if available)
- [ ] Matching confidence:
  - Exact match = 100%
  - Close match = 90-99%
  - Fuzzy match = 70-89%
  - No match = 0%
- [ ] Visual indicators:
  - Green bar (high confidence)
  - Yellow bar (medium confidence)
  - Red bar (low confidence)
- [ ] "Needs Manual Review" flag for low confidence
- [ ] Allow manual override

**Use Case:** User wants to know how reliable the verification is.

**Estimated Effort:** 3-4 hours

---

### Creative Feature 5: Side-by-Side Comparison View (Medium Value)

**Description:** Visual comparison of form inputs vs label text.

#### Implementation:
- [ ] Split-screen layout
- [ ] Left: Form with entered data
- [ ] Right: Image with highlighted text
- [ ] Linked highlighting: click form field → highlights on image
- [ ] Color coding: green (match), red (mismatch), gray (not found)

**Use Case:** User wants to visually see where discrepancies are.

**Estimated Effort:** 4-5 hours

---

### Creative Feature 6: OCR Fallback Chain (High Reliability)

**Description:** Try multiple OCR services if first one fails.

#### Implementation:
- [ ] Primary: OpenAI Vision API
- [ ] Fallback 1: Google Cloud Vision
- [ ] Fallback 2: Tesseract (local)
- [ ] Automatic retry on failure
- [ ] Compare results from multiple OCRs (if all succeed)
- [ ] Use best/most confident result
- [ ] Track which OCR service was used

**Use Case:** Ensure verification works even if one service is down.

**Estimated Effort:** 5-7 hours

---

### Creative Feature 7: Pre-Upload Image Quality Check (Medium Value)

**Description:** Warn user if image quality is too low before processing.

#### Implementation:
- [ ] Client-side image analysis:
  - Resolution check (min 800x800px recommended)
  - Blur detection (via edge detection)
  - Brightness/contrast check
  - Text density estimation
- [ ] Warning message: "This image may be too blurry. Would you like to continue?"
- [ ] Suggestions: "Try taking photo in better lighting" or "Use phone camera instead of screenshot"

**Use Case:** Save API costs by rejecting low-quality images upfront.

**Estimated Effort:** 3-4 hours

---

### Creative Feature 8: AI-Powered Fix Suggestions (High Wow Factor)

**Description:** Use AI to suggest corrections for mismatches.

#### Implementation:
- [ ] When mismatch detected, use GPT to analyze:
  - Is this a typo in form?
  - Is this a typo on label?
  - Are these actually the same (synonyms)?
- [ ] Show suggestion:
  - "Did you mean 'Old Tom' instead of 'Tom's'?"
  - "The label shows 'IPA' which matches 'India Pale Ale'"
- [ ] One-click fix button
- [ ] Learn from corrections (future: ML model)

**Use Case:** User made typo in form, AI suggests correction.

**Estimated Effort:** 5-6 hours

---

### Creative Feature 9: Mobile Camera Capture (High UX Value)

**Description:** Use phone camera directly instead of file upload.

#### Implementation:
- [ ] Detect mobile device
- [ ] "Take Photo" button (in addition to upload)
- [ ] Use `<input type="file" capture="camera">`
- [ ] Camera preview before capture
- [ ] Photo editing tools:
  - Crop
  - Rotate
  - Adjust brightness
  - Apply filters for clarity
- [ ] Guidance overlay: "Align label within frame"

**Use Case:** User is on mobile and wants to verify label in real-time.

**Estimated Effort:** 4-5 hours

---

### Creative Feature 10: Real-Time Validation (Medium UX Value)

**Description:** Validate form fields as user types.

#### Implementation:
- [ ] Check format as user types:
  - ABV: warn if >100% or <0%
  - Volume: suggest units if missing
  - Brand name: character count
- [ ] Inline suggestions:
  - "Did you mean 750 mL?" (auto-format)
  - "ABV is typically between 3-50% for most beverages"
- [ ] Green checkmark for valid fields

**Use Case:** Guide user to enter data correctly before submission.

**Estimated Effort:** 2-3 hours

---

### Creative Feature 11: Dark Mode (Low Effort, Nice Touch)

**Description:** Toggle between light and dark themes.

#### Implementation:
- [ ] Dark mode toggle in header
- [ ] Use CSS variables or Tailwind dark mode
- [ ] Save preference in localStorage
- [ ] Respect system preference by default
- [ ] Smooth transition animation

**Use Case:** User prefers dark mode for eye comfort.

**Estimated Effort:** 1-2 hours

---

### Creative Feature 12: Accessibility First (High Ethical Value)

**Description:** Make app fully accessible to all users.

#### Implementation:
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation for all features (no mouse required)
- [ ] Screen reader optimization:
  - ARIA labels
  - Semantic HTML
  - Descriptive alt text
- [ ] Color contrast ratio >4.5:1
- [ ] Focus indicators on all interactive elements
- [ ] Skip navigation links
- [ ] Form error announcements
- [ ] Accessible file upload (clear instructions)

**Use Case:** Visually impaired user needs to verify labels.

**Estimated Effort:** 3-4 hours

---

### Creative Feature 13: TTB Regulation Reference (Educational Value)

**Description:** Link to relevant TTB regulations for each check.

#### Implementation:
- [ ] Info icon (ℹ️) next to each field
- [ ] Tooltip or modal with:
  - TTB regulation reference (e.g., "27 CFR 5.38")
  - Brief explanation
  - Link to official TTB documentation
  - Examples of compliant vs non-compliant labels
- [ ] "Why is this required?" explanation
- [ ] "Learn More" links

**Use Case:** Producer wants to understand TTB requirements.

**Estimated Effort:** 2-3 hours

---

### Creative Feature 14: Comparison with Previous Versions (High Value)

**Description:** Compare new label design with previously approved label.

#### Implementation:
- [ ] Upload two images: "Current Label" and "Proposed Label"
- [ ] Side-by-side comparison
- [ ] Highlight differences (computer vision diff)
- [ ] Report what changed:
  - ABV changed from 45% to 40%
  - Net contents changed from 750mL to 1L
  - Brand name unchanged
- [ ] "Change Summary" report

**Use Case:** Producer is updating an existing product label.

**Estimated Effort:** 6-8 hours

---

### Creative Feature 15: Admin Review Panel (B2B Value)

**Description:** Admin can review and manually approve/reject verifications.

#### Implementation:
- [ ] Admin login (separate from regular users)
- [ ] Queue of pending verifications
- [ ] Review interface:
  - View form data
  - View label image
  - View AI verification results
  - Manual approve/reject buttons
  - Comment field
- [ ] Email notifications to submitter
- [ ] Audit log of all admin actions

**Use Case:** Actual TTB agent wants to use this tool with manual override.

**Estimated Effort:** 10-12 hours

---

## 📊 Priority Matrix

| Feature Category | Priority | Estimated Total Effort | ROI |
|------------------|----------|------------------------|-----|
| **Core Requirements** | CRITICAL | 16-24 hours | Essential |
| **Suggested Extras** | MEDIUM-HIGH | 20-30 hours | High (mentioned in spec) |
| **Creative Additions** | LOW-MEDIUM | 60-80 hours | Varies by feature |

---

## 🗓 Recommended Implementation Order

### Day 1 (Core MVP)
1. ✅ Documentation (DONE)
2. Project setup (Next.js, TypeScript, Tailwind)
3. Form UI with validation
4. Image upload component
5. API route setup
6. OpenAI Vision API integration
7. Basic matching logic
8. Results display
9. Error handling
10. Local testing
11. Deployment to Vercel

**Goal:** Working MVP that meets all core requirements

---

### Day 2 (Polish & Bonus - If Time Allows)
1. Polish UI/UX (loading states, animations)
2. Government warning exact text verification
3. Fuzzy matching for OCR errors
4. Confidence scores
5. Image quality pre-check
6. More comprehensive testing
7. Sample test images
8. Screenshots/demo video

**Goal:** Polished app with 2-3 bonus features

---

### Future Iterations (Post-Submission)
1. Batch processing
2. Verification history dashboard
3. PDF report generation
4. Multiple product types
5. Image highlighting
6. Admin panel
7. Automated tests

**Goal:** Production-ready product

---

## 📝 Notes

### Feature Selection Guidelines
1. **Always prioritize core requirements** - Don't start bonus features until core is 100% complete
2. **Choose high-impact, low-effort features** for bonus work
3. **Document what you didn't implement** - Mention in README why and how you'd add it
4. **Quality over quantity** - Better to have 3 polished features than 10 half-done ones

### Time Management
- Core requirements: ~70% of time
- Polish and error handling: ~20% of time
- Bonus features: ~10% of time
- Documentation: Already complete! ✅

### When to Stop
Stop adding features when:
- ✅ All core requirements work end-to-end
- ✅ App is deployed and accessible
- ✅ Basic error handling is in place
- ✅ Code is clean and readable
- ✅ Documentation is complete

**Remember:** "Better to have a working core application with clear code, than an overly ambitious project that is incomplete or buggy."

---

## ✅ Feature Checklist

Use this checklist during development:

### Must Have (Core)
- [ ] Form with all required fields
- [ ] Image upload functionality
- [ ] OCR/AI processing
- [ ] Verification logic
- [ ] Results display (success/failure/error)
- [ ] Responsive UI
- [ ] Deployed to Vercel
- [ ] README with setup instructions
- [ ] Technical documentation

### Nice to Have (Bonus)
- [ ] Exact government warning verification
- [ ] Fuzzy matching
- [ ] Loading indicators and polish
- [ ] Multiple test images
- [ ] Screenshots/demo

### Future Ideas (Creative)
- [ ] Batch processing
- [ ] History dashboard
- [ ] PDF reports
- [ ] Image highlighting
- [ ] Admin panel

---

**Current Status:** Documentation complete ✅ | Ready to start development 🚀

