# Deployment Guide

This guide provides step-by-step instructions for deploying the TTB Label Verification App to various hosting platforms.

## Table of Contents
1. [Vercel Deployment (Recommended)](#vercel-deployment-recommended)
2. [Alternative Platforms](#alternative-platforms)
3. [Environment Variables](#environment-variables)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Troubleshooting](#troubleshooting)
6. [Updating the Deployment](#updating-the-deployment)

---

## Vercel Deployment (Recommended)

Vercel is the optimal choice for Next.js applications, offering zero-configuration deployment with excellent performance.

### Prerequisites
- GitHub account
- Vercel account (free tier is sufficient)
- OpenAI API key
- Code pushed to a GitHub repository

### Step-by-Step Instructions

#### 1. Prepare Your Repository

Ensure your code is pushed to GitHub:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: TTB Label Verification App"

# Create GitHub repository and push
# (Follow GitHub's instructions for creating a new repository)
git remote add origin https://github.com/YOUR_USERNAME/doge20-takehome.git
git branch -M main
git push -u origin main
```

#### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** or **"Log In"**
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account

#### 3. Import Your Project

1. From the Vercel dashboard, click **"Add New..."** → **"Project"**
2. Find your `doge20-takehome` repository in the list
3. Click **"Import"**

#### 4. Configure Project Settings

Vercel will auto-detect that it's a Next.js project. Configure as follows:

**Framework Preset**: Next.js (should be auto-detected)

**Root Directory**: `./` (leave as default)

**Build Command**: `npm run build` (default, no change needed)

**Output Directory**: `.next` (default, no change needed)

**Install Command**: `npm install` (default, no change needed)

#### 5. Add Environment Variables

This is the most critical step!

1. In the project configuration screen, expand **"Environment Variables"**
2. Add the following variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-your-actual-api-key-here`
   - **Environment**: Select all (Production, Preview, Development)
3. Click **"Add"**

> ⚠️ **Important**: Never commit your API key to the repository. Always use environment variables.

#### 6. Deploy

1. Click **"Deploy"**
2. Wait 1-3 minutes for the build to complete
3. Once complete, you'll see **"Congratulations!"** with your deployment URL

#### 7. Test Your Deployment

1. Click on the deployment URL (e.g., `https://doge20-takehome.vercel.app`)
2. The application should load
3. Test the form and image upload functionality
4. Verify that label verification works correctly

### Vercel Dashboard Features

Once deployed, you can:
- **View logs**: Monitor API requests and errors
- **Custom domain**: Add your own domain (optional)
- **Analytics**: View traffic and performance metrics
- **Automatic deployments**: Every git push triggers a new deployment

---

## Alternative Platforms

### Netlify

Netlify is similar to Vercel and also supports Next.js.

**Steps**:
1. Go to [netlify.com](https://netlify.com)
2. Sign up and connect GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Select your repository
5. Build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
6. Environment variables:
   - Add `OPENAI_API_KEY` in Site settings → Environment variables
7. Deploy

**Note**: Netlify requires the `@netlify/plugin-nextjs` plugin for full Next.js support. Add it in `netlify.toml`:

```toml
[[plugins]]
  package = "@netlify/plugin-nextjs"
```

### Railway

Railway is great for projects needing more backend control.

**Steps**:
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Railway auto-detects Next.js
6. Add environment variables:
   - Go to **Variables** tab
   - Add `OPENAI_API_KEY`
7. Deploy automatically starts

**Pros**: More generous free tier for compute
**Cons**: Slightly more complex than Vercel

### Render

Render offers a free tier with static sites and web services.

**Steps**:
1. Go to [render.com](https://render.com)
2. Sign up and connect GitHub
3. Click **"New"** → **"Web Service"**
4. Select your repository
5. Configure:
   - **Name**: doge20-takehome
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. Add environment variable:
   - Key: `OPENAI_API_KEY`
   - Value: Your API key
7. Click **"Create Web Service"**

**Note**: May need to add a `start` script in `package.json`:
```json
{
  "scripts": {
    "start": "next start"
  }
}
```

### Heroku

Heroku is a classic PaaS option (requires credit card for free tier).

**Steps**:
1. Install Heroku CLI: `npm install -g heroku`
2. Login: `heroku login`
3. Create app: `heroku create doge20-takehome`
4. Add buildpack: `heroku buildpacks:set heroku/nodejs`
5. Set environment variable:
   ```bash
   heroku config:set OPENAI_API_KEY=sk-your-key-here
   ```
6. Deploy:
   ```bash
   git push heroku main
   ```
7. Open: `heroku open`

---

## Environment Variables

### Required Variables

| Variable | Description | Example | Where to get |
|----------|-------------|---------|--------------|
| `OPENAI_API_KEY` | OpenAI API authentication key | `sk-...` | https://platform.openai.com/api-keys |

### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `OPENAI_MODEL` | Which OpenAI vision model to use | `gpt-4o` | `gpt-4o`, `gpt-4-turbo` |
| `NODE_ENV` | Environment mode | `production` | `production`, `development` |
| `MAX_IMAGE_SIZE` | Maximum upload size in bytes | `10485760` (10MB) | `5242880` (5MB) |

### How to Set Environment Variables

**Vercel**:
- Dashboard → Project → Settings → Environment Variables

**Netlify**:
- Dashboard → Site → Site settings → Environment variables

**Railway**:
- Project → Variables tab

**Render**:
- Dashboard → Service → Environment → Environment Variables

**Heroku**:
```bash
heroku config:set VARIABLE_NAME=value
```

**Local Development**:
Create `.env.local` file:
```
OPENAI_API_KEY=sk-your-key-here
```

---

## Post-Deployment Verification

After deploying, verify the following:

### 1. Health Check
Visit your deployed URL and check:
- [ ] Page loads without errors
- [ ] No console errors in browser DevTools (F12)
- [ ] Form renders correctly
- [ ] Image upload button is visible

### 2. Functionality Check
- [ ] Fill out form with test data
- [ ] Upload a test label image
- [ ] Click "Verify Label"
- [ ] Results appear after 3-15 seconds
- [ ] Results show expected match/mismatch

### 3. Error Handling Check
- [ ] Try submitting without image → Should show error
- [ ] Try submitting with empty fields → Should show validation errors
- [ ] Try uploading non-image file → Should show error

### 4. Performance Check
- [ ] Initial page load: <3 seconds
- [ ] Form submission to results: <30 seconds
- [ ] No timeouts or crashes

### 5. Cross-Browser Check
Test on:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browser

### 6. API Integration Check
Look for these in deployment logs:
- [ ] No API authentication errors
- [ ] API requests completing successfully
- [ ] No rate limit errors

---

## Troubleshooting

### Issue: "API key not configured" error

**Cause**: Environment variable not set correctly

**Solution**:
1. Check that `OPENAI_API_KEY` is set in deployment platform
2. Ensure no typos in variable name (exact match required)
3. Redeploy after adding environment variable
4. Check deployment logs for confirmation

### Issue: Build fails with "Module not found"

**Cause**: Missing dependencies in `package.json`

**Solution**:
1. Ensure all imports are from installed packages
2. Run `npm install` locally to verify
3. Check `package.json` has all required dependencies
4. Try deleting `node_modules` and `.next`, then rebuild

### Issue: 500 Internal Server Error on API route

**Cause**: Runtime error in API route or invalid API key

**Solution**:
1. Check deployment logs for error details
2. Verify API key is valid and has credits
3. Test API key locally first
4. Check for any try-catch blocks missing

### Issue: Images not uploading

**Cause**: File size limit or MIME type issue

**Solution**:
1. Check if image is >10MB (default limit)
2. Ensure image is JPEG, PNG, or similar
3. Check network tab in DevTools for exact error
4. Increase size limit if needed (see Environment Variables)

### Issue: OCR returns no text

**Cause**: Image quality too low or API issue

**Solution**:
1. Try with a different, clearer image
2. Ensure text on label is readable by humans
3. Check OpenAI API status page
4. Review API response in server logs

### Issue: Deployment succeeds but page shows 404

**Cause**: Routing issue or build output problem

**Solution**:
1. Check that `app/page.tsx` exists
2. Verify Next.js version is 13+ (for App Router)
3. Check build output directory is set to `.next`
4. Review deployment logs for build warnings

### Issue: Works locally but not in production

**Cause**: Environment differences or missing env variables

**Solution**:
1. Compare local `.env.local` with production environment variables
2. Check for any hardcoded `localhost` URLs
3. Ensure all dependencies are in `package.json` (not just devDependencies)
4. Test with `npm run build` and `npm start` locally

---

## Updating the Deployment

### Automatic Updates (Git-Based Deployments)

Vercel, Netlify, and Railway automatically redeploy when you push to GitHub:

```bash
# Make changes to code
git add .
git commit -m "Update: description of changes"
git push origin main

# Deployment starts automatically
# Check platform dashboard for status
```

### Manual Redeployment

**Vercel**: 
- Go to Deployments tab
- Click "Redeploy" on any previous deployment

**Netlify**:
- Go to Deploys tab
- Click "Trigger deploy" → "Deploy site"

**Railway**:
- Click "Deploy" button in project dashboard

**Render**:
- Go to Events tab
- Click "Manual Deploy" → "Deploy latest commit"

### Rollback to Previous Version

**Vercel**:
1. Go to Deployments tab
2. Find previous working deployment
3. Click "..." → "Promote to Production"

**Netlify**:
1. Go to Deploys tab
2. Find previous deploy
3. Click "Publish deploy"

---

## Monitoring and Logs

### Viewing Logs

**Vercel**:
- Dashboard → Project → Logs (real-time)
- Or Functions tab for API route logs

**Netlify**:
- Dashboard → Site → Logs → Functions

**Railway**:
- Project → Deployments → Click on deployment → Logs tab

**Render**:
- Dashboard → Service → Logs tab

### What to Monitor

- **API errors**: Failed OpenAI API calls
- **Rate limits**: Too many requests
- **Build failures**: Deployment issues
- **Performance**: Slow response times

### Setting Up Alerts (Optional)

Most platforms offer alerting:
- Email notifications for failed deployments
- Slack/Discord webhooks
- Error tracking (e.g., Sentry integration)

---

## Cost Considerations

### Vercel Free Tier
- ✅ 100 GB bandwidth
- ✅ Unlimited personal projects
- ✅ Automatic HTTPS
- ⚠️ Serverless function execution time limits

### OpenAI API Costs
- GPT-4o vision: ~$0.01 per image
- Free tier: $5-18 in credits (varies by account)
- Monitor usage at: https://platform.openai.com/usage

### Total Estimated Cost
- **Development/Testing**: Free (using free tiers)
- **Low usage (<100 verifications/month)**: ~$1/month
- **Medium usage (1000 verifications/month)**: ~$10/month

---

## Security Best Practices

### Do's ✅
- Use environment variables for API keys
- Never commit `.env.local` or `.env` files
- Keep dependencies updated
- Use HTTPS only (automatic with Vercel)
- Validate all user inputs
- Set file upload size limits

### Don'ts ❌
- Don't expose API keys in client-side code
- Don't commit sensitive data
- Don't disable security headers
- Don't skip input validation
- Don't use `eval()` or similar dangerous functions

---

## Deployment Checklist

Before announcing your deployment:

- [ ] Application deployed successfully
- [ ] Custom domain configured (optional)
- [ ] Environment variables set correctly
- [ ] All features tested in production
- [ ] Error handling works
- [ ] Performance is acceptable
- [ ] Logs are accessible
- [ ] API costs are monitored
- [ ] README updated with deployment URL
- [ ] Documentation is complete
- [ ] Repository is clean (no sensitive data)
- [ ] `.gitignore` is properly configured

---

## Getting Help

If you encounter deployment issues:

1. **Check documentation**:
   - [Vercel Docs](https://vercel.com/docs)
   - [Next.js Deployment Docs](https://nextjs.org/docs/deployment)

2. **Review logs**: Most issues show up in deployment logs

3. **Community support**:
   - Vercel Discord
   - Next.js GitHub Discussions
   - Stack Overflow

4. **Contact platform support**: Most platforms have support tickets for deployment issues

---

**Deployment successful!** 🚀

Your TTB Label Verification App is now live and accessible to the world.

Share your deployment URL:
```
https://your-app-name.vercel.app
```

