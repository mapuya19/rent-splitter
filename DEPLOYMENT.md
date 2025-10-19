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

3. **Environment Variables (Optional)**
   - In Vercel dashboard, go to Settings > Environment Variables
   - Add: `NEXT_PUBLIC_APP_URL` = `https://your-app-name.vercel.app`

### Shareable Links
The shareable links will work automatically in production. The app uses:
- `window.location.origin` to get the current domain
- `localStorage` for data persistence
- URL parameters to share calculations

### Features Included
- ✅ Square footage-based rent splitting
- ✅ Income-based rent splitting (fallback)
- ✅ Even utilities and expenses splitting
- ✅ Shareable links with localStorage
- ✅ Responsive design
- ✅ Copy to clipboard functionality

### Custom Domain (Optional)
- In Vercel dashboard, go to Settings > Domains
- Add your custom domain
- Update `NEXT_PUBLIC_APP_URL` environment variable
