# Deployment Guide for Rent Splitter

## Vercel Deployment (Free Tier)

### Prerequisites
- GitHub account
- Vercel account (free at vercel.com)

### Steps to Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js
   - Click "Deploy"

3. **Environment Variables**
   - In Vercel dashboard, go to Settings > Environment Variables
   - **Required**: Add `MODEL_API_KEY` with your Groq API key (get from [console.groq.com/keys](https://console.groq.com/keys))
   - **Optional**: Add `NEXT_PUBLIC_APP_URL` = `https://your-app-name.vercel.app`

### Shareable Links
URL-based sharing with compressed data encoding:
- No database required (all data in URL)
- Includes currency, split method, and all calculation data

### Features Included
- ✅ Square footage-based rent splitting
- ✅ Income-based rent splitting
- ✅ Even utilities and expenses splitting
- ✅ URL-based shareable links (no database needed)
- ✅ Complete data sharing (currency, split method, all calculations)
- ✅ Responsive design
- ✅ Copy to clipboard functionality

### Custom Domain (Optional)
- In Vercel dashboard, go to Settings > Domains
- Add your custom domain
- Update `NEXT_PUBLIC_APP_URL` environment variable
