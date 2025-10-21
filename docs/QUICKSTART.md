# Quick Start Guide

Get the TTB Label Verification app running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Copy the template
cp env.template .env.local
```

Edit `.env.local` and add your OpenAI API key:

```
OPENAI_API_KEY=sk-your-actual-api-key-here
```

### How to Get an OpenAI API Key

1. Go to https://platform.openai.com/
2. Sign up or log in
3. Navigate to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the key and paste it into `.env.local`

> **Note:** You'll need API credits. New accounts typically get $5-18 in free credits.

## Step 3: Run the Development Server

```bash
npm run dev
```

Open http://localhost:3000 in your browser!

## Step 4: Test the Application

### Sample Data for Testing

Try this test data:

**Form Fields:**
- Brand Name: `Old Tom Distillery`
- Product Type: `Kentucky Straight Bourbon Whiskey`
- Alcohol Content: `45`
- Net Contents: `750 mL`

**Test Image:**
Use any of the sample images in `public/sample-labels/` or create your own label image with the above information clearly visible.

### Creating a Test Label Image

You can create test images using:

1. **AI Image Generators:**
   - DALL-E: "Create a bourbon whiskey bottle label with the text 'Old Tom Distillery', 'Kentucky Straight Bourbon Whiskey', '45% ABV', '750 mL', and 'GOVERNMENT WARNING' at the bottom"
   - Midjourney, Stable Diffusion, etc.

2. **Graphic Design Tools:**
   - Canva (search for "label templates")
   - Figma, Photoshop, or GIMP

3. **Simple Text Overlay:**
   - Take any bottle image
   - Add text overlays with required information
   - Save as PNG or JPEG

### What to Test

1. ✅ **Perfect Match** - All fields match
2. ❌ **Brand Mismatch** - Wrong brand name
3. ❌ **ABV Mismatch** - Different alcohol percentage
4. ⚠️ **Missing Warning** - Label without government warning
5. 🚫 **Unreadable Image** - Blurry or low-quality image

## Troubleshooting

### "API key not configured"
- Make sure `.env.local` exists with `OPENAI_API_KEY`
- Restart the dev server (`npm run dev`)

### "Could not read text"
- Try a clearer, higher-resolution image
- Ensure text is readable by humans first

### Port already in use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on different port
npm run dev -- -p 3001
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [TESTING.md](TESTING.md) for comprehensive test scenarios
- See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions

---

**Ready to deploy?** See [DEPLOYMENT.md](DEPLOYMENT.md) for Vercel deployment steps.

