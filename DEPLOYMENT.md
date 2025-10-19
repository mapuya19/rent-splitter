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
The shareable links work automatically in production using URL-based sharing:
- **No database required** - all data is encoded in the URL
- **Base64 encoding** - calculation data is safely encoded in URL parameters
- **Complete data sharing** - includes currency, split method, and all calculation data
- **Works offline** - shared links work without server dependencies

### Features Included
- ✅ Square footage-based rent splitting
- ✅ Income-based rent splitting (fallback)
- ✅ Even utilities and expenses splitting
- ✅ URL-based shareable links (no database needed)
- ✅ Complete data sharing (currency, split method, all calculations)
- ✅ Responsive design
- ✅ Copy to clipboard functionality

### Custom Domain (Optional)
- In Vercel dashboard, go to Settings > Domains
- Add your custom domain
- Update `NEXT_PUBLIC_APP_URL` environment variable
