# TTB Label Verification App

An AI-powered web application that simulates the Alcohol and Tobacco Tax and Trade Bureau (TTB) label approval process. The app verifies that information on alcohol beverage labels matches the data submitted in application forms.

## 🎯 Overview

This application offers **two verification modes**:

### **Single Mode** (Individual verification)
- Fill out product information via web form or scan TTB application form
- Upload label image or use camera on mobile devices
- AI verifies if the label matches the form data using GPT-4o Vision
- Receive detailed results with confidence scores
- Manual override capability for human review
- Download professional PDF report

### **Bulk Mode** (Enterprise batch processing)
- Upload CSV with up to 100 product forms
- Upload up to 100 label images
- AI intelligently matches forms to labels by brand name
- Batch verifies all pairs simultaneously
- View results dashboard with statistics
- Export complete results to CSV

## 🌟 Highlights

**What makes this app special:**
- 🤖 **GPT-4o Vision** - Latest AI model for superior OCR accuracy
- 📦 **Bulk Processing** - Verify 100 labels at once (enterprise feature)
- 👤 **Manual Override** - Human review when AI needs help
- 📊 **Confidence Scores** - See AI certainty (0-100%) for every check
- 📸 **Mobile Camera** - Instant capture on phones (auto-detected)
- 🔍 **Form Scanning** - Auto-fill from application form photos
- ✅ **TTB Compliance** - Exact government warning verification
- 📄 **Professional Reports** - PDF and CSV export

## ✨ Features

### Core Features
- **Dual-Mode Interface**: Single verification or bulk processing (up to 100 labels)
- **Smart Form**: Category selector (Spirits/Wine/Beer) with dynamic fields
- **Product Type Dropdown**: 40+ common types OR custom input
- **Form Scanning**: Auto-fill from TTB application form photo
- **Triple Upload Options**: Drag-drop, camera capture (mobile), or file browser
- **AI-Powered OCR**: GPT-4o Vision API for superior accuracy
- **Intelligent Verification**: Advanced fuzzy matching with Levenshtein distance
- **Confidence Scores**: 0-100% transparency for every check
- **Manual Override**: Human review and approval system
- **Professional Reports**: PDF download for single, CSV export for bulk
- **Advanced Loading**: Multi-step progress with countdown timer

### Verification Checks
- ✅ Brand Name matching (with fuzzy matching)
- ✅ Product Class/Type matching (tolerates variations)
- ✅ Alcohol Content (ABV) matching (±0.1% tolerance)
- ✅ Net Contents (volume) matching (unit normalization)
- ✅ Government Warning Statement (exact TTB compliance check)

### Bonus Features (From Requirements)
- ✅ **Exact Government Warning Verification** - Word-for-word TTB compliance (27 CFR 16.21)
- ✅ **Enhanced Fuzzy Matching** - Levenshtein distance algorithm handles OCR errors
- ✅ **Confidence Scores** - 0-100% for all checks with color-coded badges
- ✅ **Multiple Product Types** - Spirits/Wine/Beer with dynamic fields
- ✅ **Polish & UX** - Advanced loading indicators, animations, professional design
- ⚠️ **Automated Tests** - Comprehensive manual tests (automated tests documented for future)

### Creative Additions (Beyond Requirements)
- 🚀 **Bulk Upload** - Process up to 100 labels with intelligent form-to-label matching
- 📸 **Camera Capture** - Mobile-only photo button for instant capture
- 🔍 **Form Scanning** - Auto-fill form fields from TTB application photo
- 📄 **PDF Export** - Professional downloadable verification reports
- 📊 **CSV Export** - Batch results export for record-keeping
- 👤 **Manual Override** - Human review and approval for edge cases
- 📱 **Mobile Detection** - Smart UX that adapts to device capabilities

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript 5** - Full type safety and strict mode
- **Tailwind CSS** - Utility-first styling with custom theme
- **React 18** - Modern React with hooks
- **jsPDF** - PDF report generation

### Backend
- **Next.js API Routes** - Serverless functions (3 endpoints)
- **OpenAI Vision API** - GPT-4o model for high-accuracy OCR
- **Custom Algorithms** - Levenshtein distance for fuzzy matching

### Key Libraries
- **OpenAI SDK** - AI/ML integration
- **jsPDF** - PDF generation
- **Custom Hooks** - Mobile detection, state management

### Deployment
- **Vercel** - Production hosting with auto-deployments
- **GitHub** - Version control with CI/CD

## 📋 Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn** or **pnpm**
- **OpenAI API Key** (for OCR functionality)

## 🚀 Local Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd doge20-takehome
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp env.template .env.local
```

Add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-api-key-here
```

**How to get an OpenAI API Key:**
1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy and paste it into `.env.local`

### 4. Run the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Testing the Application

### Run Automated Tests

```bash
# Unit tests (Jest)
npm run test:unit

# End-to-end tests (Playwright)
npm run test:e2e

# Both
npm test
```

### Quick Test (Single Mode)

1. **Use the Test Label Generator**
   - Visit http://localhost:3000/test-label-generator.html
   - Save the generated label image
   - Return to main app at http://localhost:3000

2. **Fill Out Form**
   - Select category: "Distilled Spirits"
   - Product type: "Kentucky Straight Bourbon Whiskey" (or use dropdown)
   - Brand: "Old Tom Distillery"
   - ABV: "45"
   - Volume: "750 mL"
   - Upload the saved label image

3. **Verify**
   - Click "Verify Label"
   - Should see all green checkmarks with 100% confidence ✅
   - Try "Download PDF Report"

4. **Test Override Feature**
   - Change ABV to "40" (intentional mismatch)
   - Submit again
   - Click "Manual Review" button
   - Override the ABV field
   - Watch result update to PASSED with override notation

### Quick Test (Bulk Mode)

1. **Download Sample CSV**
   - Click "Bulk Upload" tab
   - Download the sample CSV template
   
2. **Upload Files**
   - Upload the CSV
   - Upload 3-5 label images
   - Click "Verify X Labels"

3. **View Results**
   - Check dashboard statistics
   - Export results to CSV

### Additional Features to Test

- **Form Scanning**: Click "Scan Form" button and upload a form image
- **Camera Capture**: On mobile, use "Take Photo with Camera"
- **Product Type Dropdown**: Try selecting from dropdown or custom input
- **Confidence Scores**: Check colored badges on all results
- **Manual Override**: Test overriding AI decisions

**For comprehensive testing guide with 12 detailed scenarios, see [docs/TESTING.md](docs/TESTING.md)**

## 📦 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables:
   - `OPENAI_API_KEY`: Your OpenAI API key
5. Deploy!

Vercel will automatically:
- Build your Next.js application
- Set up serverless functions for API routes
- Provide a production URL
- Enable automatic deployments on git push

### Alternative Deployment Options

- **Netlify**: Similar to Vercel, supports Next.js
- **Railway**: Good for apps needing more backend control
- **Render**: Free tier with Docker support

## 🏗 Project Structure

```
doge20-takehome/
├── app/
│   ├── api/
│   │   ├── bulk-verify/route.ts   # Batch verification endpoint
│   │   ├── scan-form/route.ts     # Form scanning endpoint
│   │   └── verify/route.ts        # Single verification endpoint
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Main application with tabs
│   └── globals.css                # Global styles
├── components/
│   ├── BulkResults.tsx            # Bulk results dashboard
│   ├── BulkUpload.tsx             # Bulk upload interface
│   ├── ImageUpload.tsx            # Image upload with camera
│   ├── LabelForm.tsx              # Form with product type dropdown
│   ├── LoadingProgress.tsx        # Advanced loading UI
│   ├── TabNavigation.tsx          # Single/Bulk tabs
│   └── VerificationResults.tsx    # Results with override feature
├── lib/
│   ├── hooks.ts                   # Custom React hooks
│   ├── ocr.ts                     # OpenAI Vision API service
│   └── verification.ts            # Verification algorithms
├── types/
│   └── index.ts                   # TypeScript definitions
├── public/
│   ├── sample-bulk-upload.csv     # CSV template for bulk upload
│   └── test-label-generator.html  # Test label generator
├── docs/                          # 📚 All documentation
│   ├── QUICKSTART.md              # Quick setup guide
│   ├── APPROACH.md                # Technical decisions
│   ├── TESTING.md                 # Testing guide
│   ├── DEPLOYMENT.md              # Deployment guide
│   ├── FEATURES.md                # Feature roadmap
│   ├── BONUS_FEATURES.md          # Bonus implementations
│   ├── BULK_UPLOAD_GUIDE.md       # Bulk feature guide
│   ├── NEXT_STEPS.md              # Action items
│   ├── PROJECT_SUMMARY.md         # Project overview
│   ├── FINAL_SUMMARY.md           # Complete summary
│   └── CAMERA_FEATURE_GUIDE.md    # Camera usage
├── env.template                   # Environment variables template
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── LICENSE
└── README.md                      # You are here!
```

## 🧠 Technical Approach

### OCR Solution: OpenAI Vision API

**Why OpenAI Vision API?**
- ✅ High accuracy for text extraction from images
- ✅ Understands context, not just OCR (can identify what fields mean)
- ✅ Simple API, no training required
- ✅ Handles various image qualities and formats
- ✅ Can detect layout and structure of labels

**Alternatives Considered:**
- **Tesseract OCR**: Free and local, but lower accuracy for stylized text
- **Google Cloud Vision**: Similar quality, but more complex setup
- **AWS Textract**: Excellent for documents, overkill for this use case

### Matching Logic

The verification algorithm implements intelligent matching:

1. **Text Extraction**: Send image to OpenAI Vision API with structured prompt
2. **Normalization**: 
   - Convert to lowercase for case-insensitive matching
   - Remove extra whitespace
   - Handle common variations (e.g., "45%" vs "45 %")
3. **Field Matching**:
   - **Brand Name**: Exact substring match (normalized)
   - **Product Type**: Fuzzy match allowing partial matches
   - **ABV**: Extract numbers, match percentage value
   - **Volume**: Match both number and unit (mL, oz, etc.)
   - **Government Warning**: Check for "GOVERNMENT WARNING" phrase
4. **Result Aggregation**: Compile all matches/mismatches into structured response

### Assumptions & Design Decisions

1. **Case-Insensitive Matching**: "Old Tom" matches "old tom" or "OLD TOM"
2. **Whitespace Tolerance**: Extra spaces ignored
3. **Number Extraction**: "45% ABV" and "45%" both match ABV of 45
4. **Partial Type Matching**: "Bourbon" can match "Kentucky Straight Bourbon Whiskey"
5. **Government Warning**: Checks for exact TTB-compliant text (27 CFR 16.21) plus required phrases
6. **Image Quality**: Assumes reasonably clear images; provides error message for unreadable images
7. **Single Language**: English only (TTB labels are in English)
8. **Manual Override**: Humans can override AI decisions when needed
9. **Concurrency Control**: Bulk mode processes 5 labels concurrently with retry logic

### Known Limitations

1. **OCR Accuracy**: Very stylized fonts or low-resolution images may not be read accurately
2. **API Dependency**: Requires internet connection and valid OpenAI API key
3. **Cost**: OpenAI API has usage costs (~$0.01 per label, ~$1.00 for 100 labels)
4. **No Database**: Results are not persisted between sessions (export to PDF/CSV for records)
5. **Bulk Timeout**: Large batches (100 labels) may approach 5-minute API timeout
6. **Sequential CSV Parsing**: Very large CSV files may take time to parse

## 🔮 Future Enhancements

Potential features for future iterations:

### High Priority
- [ ] **Image Highlighting**: Visually mark where text was found on the label with bounding boxes
- [ ] **Result History**: Database to save previous verifications
- [ ] **Automated E2E Tests**: Playwright/Cypress test suite
- [ ] **PDF Label Support**: Handle PDF label submissions in addition to images
- [ ] **Per-Row PDF in Bulk**: Export individual PDF for each label in bulk mode

### Medium Priority
- [ ] **OCR Fallback**: Use Tesseract when OpenAI API is unavailable
- [ ] **Bulk Details Modal**: Structured modal instead of alert for bulk row details
- [ ] **Admin Dashboard**: View all submissions with statistics and analytics
- [ ] **Advanced Compliance**: Wine appellations, geographic indicators, TTB-specific rules
- [ ] **Real-Time Bulk Progress**: Show "Processing 5 of 100..." live updates

### Low Priority
- [ ] **User Authentication**: Account system to save and track verifications
- [ ] **Collaboration Features**: Share verifications with team members
- [ ] **Multi-language Support**: Handle international labels
- [ ] **Image Quality Pre-Check**: Warn if image is too blurry before processing
- [ ] **Proof-to-ABV Conversion**: Handle "90 Proof" and convert to ABV automatically

## 🐛 Troubleshooting

### "API key not configured"
- Make sure `.env.local` exists and contains `OPENAI_API_KEY`
- Restart the dev server after adding environment variables

### "Could not read text from image"
- Try a clearer, higher-resolution image
- Ensure the text on the label is legible
- Check that the image file isn't corrupted

### Build errors
- Delete `.next` folder and `node_modules`
- Run `npm install` again
- Make sure you're using Node.js 18+

### Deployment fails on Vercel
- Verify environment variables are set in Vercel dashboard
- Check build logs for specific errors
- Ensure `package.json` has correct build scripts

## 📝 License

This project is created as a take-home assignment and is for demonstration purposes.

## 📚 Additional Documentation

All detailed documentation is organized in the `/docs` folder:

### Getting Started
- **[Quick Start Guide](docs/QUICKSTART.md)** - Get running in 5 minutes
- **[Next Steps](docs/NEXT_STEPS.md)** - Your action items after setup
- **[Deployment Guide](docs/DEPLOYMENT.md)** - Deploy to Vercel step-by-step

### Technical Details
- **[Technical Approach](docs/APPROACH.md)** - Architecture and design decisions
- **[Features Breakdown](docs/FEATURES.md)** - Complete feature roadmap
- **[Bonus Features](docs/BONUS_FEATURES.md)** - All bonus implementations explained

### User Guides
- **[Testing Guide](docs/TESTING.md)** - 12 test scenarios with instructions
- **[Bulk Upload Guide](docs/BULK_UPLOAD_GUIDE.md)** - Enterprise batch processing
- **[Camera Feature Guide](docs/CAMERA_FEATURE_GUIDE.md)** - Mobile camera usage

### Project Summaries
- **[Project Summary](docs/PROJECT_SUMMARY.md)** - High-level overview
- **[Final Summary](docs/FINAL_SUMMARY.md)** - Complete project statistics

## 🙋 Questions or Issues?

If you encounter any problems or have questions about the implementation, please reach out or open an issue in the repository.

---

**Built with ❤️ for the TTB Label Verification Take-Home Project**

