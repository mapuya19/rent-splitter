# Rent Splitter

A free, easy-to-use rent and utilities calculator for roommates. Split rent proportionally based on income or room size, and utilities evenly between roommates. Generate shareable links to collaborate with your roommates.

## Features

- 💰 **Income-based rent splitting** - Split rent based on annual income (higher earners pay more)
- 📏 **Room size-based rent splitting** - Split rent based on square footage (larger rooms pay more)
- 🔧 **Room adjustments** - Adjust for private bathrooms, windows, and flexible walls
- ⚡ **Even utilities splitting** - Utilities and expenses are always split evenly
- 💵 **Multi-currency support** - Support for USD, EUR, GBP, CAD, AUD, and more
- 🔗 **Shareable links** - Generate compressed URLs to share calculations with roommates
- 📱 **Responsive design** - Works perfectly on desktop, tablet, and mobile

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- [Next.js 15](https://nextjs.org) - React framework with App Router
- [TypeScript](https://www.typescriptlang.org) - Type safety
- [Tailwind CSS](https://tailwindcss.com) - Styling
- [Jest](https://jestjs.io) - Testing framework
- [React Testing Library](https://testing-library.com/react) - Component testing

## SEO Optimization

This project is optimized for search engines with:

- ✅ Comprehensive metadata (Open Graph, Twitter Cards)
- ✅ JSON-LD structured data (Schema.org)
- ✅ Sitemap.xml generation
- ✅ Robots.txt configuration
- ✅ Semantic HTML structure
- ✅ Mobile-responsive design
- ✅ Fast page load times

See `DEPLOYMENT.md` for deployment instructions.

## Testing

Run the test suite:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

See `src/__tests__/README.md` for detailed testing documentation.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Environment Variables

### Required

- `MODEL_API_KEY` - Your OpenRouter API key for chatbot functionality (Meta Llama model)
  - Get your API key from: https://openrouter.ai/keys
  - **IMPORTANT**: Never commit your API key to version control
  - For local development: Create a `.env.local` file (see `.env.example` for template)
  - For Vercel deployment: Set it in your Vercel project settings under Environment Variables

### Optional

- `NEXT_PUBLIC_APP_URL` - Your app's public URL (defaults to `https://rent-splitter.vercel.app`)
- `NEXT_PUBLIC_GOOGLE_VERIFICATION` - Google Search Console verification code (optional)

### Setup Instructions

1. **Local Development**:
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local and add your API key
   # MODEL_API_KEY=your-actual-api-key-here
   ```

2. **Vercel Deployment**:
   - Go to your Vercel project settings
   - Navigate to "Environment Variables"
   - Add `MODEL_API_KEY` with your OpenRouter API key
   - Redeploy your application

**Note**: The `.env.local` file is gitignored and will not be committed. Use `.env.example` as a template for the required variables.

## License

MIT
