# Deployment Guide

## Vercel (Recommended)

### Prerequisites

- GitHub account
- Vercel account (free at [vercel.com](https://vercel.com))
- Groq API key (get from [console.groq.com/keys](https://console.groq.com/keys))

### Steps

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Deploy**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-detects Next.js configuration
   - Click "Deploy"

3. **Configure environment variables**
   - Go to Settings → Environment Variables
   - Add required variable:
     ```
     MODEL_API_KEY = sk-xxxxxxxxxxxxxxxxxxxxx
     ```
   - Add optional variables:
     ```
     NEXT_PUBLIC_APP_URL = https://your-app.vercel.app
     NEXT_PUBLIC_GOOGLE_VERIFICATION = verification_code
     ```

4. **Custom domain (optional)**
   - Settings → Domains
   - Add your domain
   - Update `NEXT_PUBLIC_APP_URL`

## Other Platforms

### Netlify
```bash
npm run build
# Deploy _next/ folder to Netlify
```

### Railway / Render / AWS Amplify
- Import GitHub repository
- Add environment variables
- Build command: `npm run build`
- Start command: `npm start`

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["npm", "start"]
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MODEL_API_KEY` | Yes | Groq API key for chatbot |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL (for sharing) |
| `NEXT_PUBLIC_GOOGLE_VERIFICATION` | No | Google Search Console verification code |

## Troubleshooting

**Build fails:**
- Clear cache: `npm run build -- --clean`
- Check Node.js version (requires 18+)

**Chatbot not responding:**
- Verify `MODEL_API_KEY` is set
- Check Groq API quota

**Shareable links not working:**
- Ensure `NEXT_PUBLIC_APP_URL` is set correctly
