# TTB Label Verification App

An AI-powered web application that simulates the Alcohol and Tobacco Tax and Trade Bureau (TTB) label approval process. The app verifies that information on alcohol beverage labels matches the data submitted in application forms.

## 🎯 Overview

This application allows users to:
- Submit product information via a web form (brand name, product type, alcohol content, net contents)
- Upload an image of an alcohol label
- Automatically verify if the label matches the form data using AI-powered OCR
- Receive detailed results showing what matched, what didn't, and any missing information

## ✨ Features

### Core Features
- **Interactive Form**: Clean, user-friendly form for entering product information
- **Image Upload**: Support for JPEG, PNG, and other common image formats
- **AI-Powered OCR**: Extracts text from label images using OpenAI Vision API
- **Smart Verification**: Compares extracted text with form inputs
- **Detailed Results**: Clear success/failure messages with specific discrepancies
- **Error Handling**: Graceful handling of unreadable images, missing fields, etc.

### Verification Checks
- ✅ Brand Name matching
- ✅ Product Class/Type matching
- ✅ Alcohol Content (ABV) matching
- ✅ Net Contents (volume) matching
- ✅ Government Warning Statement detection

### Bonus Features
- Fuzzy matching for text variations (case-insensitive, whitespace tolerant)
- Visual feedback with success/error states
- Responsive design for mobile and desktop
- Comprehensive error messages

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety and better DX
- **Tailwind CSS** - Utility-first styling
- **React Hook Form** - Form state management

### Backend
- **Next.js API Routes** - Serverless functions
- **OpenAI Vision API** - High-accuracy OCR and image analysis

### Deployment
- **Vercel** - Optimized for Next.js applications

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
cp .env.example .env.local
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

### Manual Testing Scenarios

1. **Perfect Match Test**
   - Fill out form with: Brand="Old Tom Distillery", Type="Kentucky Straight Bourbon Whiskey", ABV="45", Volume="750 mL"
   - Upload a label image containing all this information
   - Expected: All checks pass ✅

2. **Mismatch Test**
   - Fill out form with different information than what's on the label
   - Expected: Specific discrepancies reported ❌

3. **Missing Field Test**
   - Upload a label that's missing the government warning
   - Expected: Warning about missing government warning text

4. **Unreadable Image Test**
   - Upload a blurry or low-quality image
   - Expected: Error message asking for clearer image

### Sample Test Images

You can create test images using:
- AI image generators (DALL-E, Midjourney, etc.)
- Graphic design tools (Canva, Figma, Photoshop)
- Simple text overlays on stock images

Example labels should include:
- Brand name prominently displayed
- Product type/class
- Alcohol percentage (e.g., "45% ABV" or "45% Alc./Vol.")
- Volume (e.g., "750 mL" or "12 fl oz")
- Government warning text (small text at bottom)

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
│   │   └── verify/
│   │       └── route.ts          # API endpoint for label verification
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Main application page
│   └── globals.css                # Global styles
├── components/
│   ├── LabelForm.tsx              # Form component
│   ├── ImageUpload.tsx            # Image upload component
│   └── VerificationResults.tsx    # Results display component
├── lib/
│   ├── ocr.ts                     # OCR service (OpenAI Vision)
│   └── verification.ts            # Matching logic
├── types/
│   └── index.ts                   # TypeScript type definitions
├── public/
│   └── sample-labels/             # Sample test images
├── .env.example                   # Environment variables template
├── .env.local                     # Your local environment variables (git-ignored)
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── next.config.js
└── README.md
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
5. **Government Warning**: Just checking for presence, not exact wording (bonus feature would be exact match)
6. **Image Quality**: Assumes reasonably clear images; provides error message for unreadable images
7. **Single Language**: English only (TTB labels are in English)

### Known Limitations

1. **OCR Accuracy**: Very stylized fonts or low-resolution images may not be read accurately
2. **API Dependency**: Requires internet connection and valid OpenAI API key
3. **Cost**: OpenAI API has usage costs (though minimal for this use case)
4. **No Database**: Results are not persisted between sessions
5. **Single Image**: Only processes one label at a time
6. **Basic Fuzzy Matching**: Could be improved with Levenshtein distance or ML-based matching

## 🔮 Future Enhancements

If given more time, the following features could be added:

### High Priority
- [ ] **Exact Government Warning Verification**: Compare full warning text word-for-word
- [ ] **Multiple Image Upload**: Process multiple labels in one submission
- [ ] **Result History**: Save previous verifications (add database)
- [ ] **Image Highlighting**: Visually mark where text was found on the label
- [ ] **PDF Support**: Handle PDF label submissions

### Medium Priority
- [ ] **Product Type Templates**: Different required fields for beer/wine/spirits
- [ ] **Batch Processing**: Upload multiple labels via CSV + images
- [ ] **Export Results**: Download verification report as PDF
- [ ] **Admin Dashboard**: View all submissions, statistics
- [ ] **Fallback OCR**: Use Tesseract if OpenAI API fails

### Low Priority
- [ ] **User Authentication**: Save and track user submissions
- [ ] **Collaboration Features**: Share verifications with team
- [ ] **Advanced Compliance**: TTB-specific rules (wine designations, geographic indicators, etc.)
- [ ] **Multi-language Support**: Handle labels in multiple languages
- [ ] **Automated Testing**: E2E tests with Playwright

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

## 🙋 Questions or Issues?

If you encounter any problems or have questions about the implementation, please reach out or open an issue in the repository.

---

**Built with ❤️ for the TTB Label Verification Take-Home Project**

